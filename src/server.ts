import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';
import * as ExaModule from 'exa-js';
import { env } from './config.js';
import { db } from './db.js';
import { registerBuilderRoutes } from './builder.js';
import { ensureOfficialIremboCatalog } from './irembo-catalog.js';

const app = Fastify({ logger: true });
const secret = new TextEncoder().encode(env.JWT_SECRET);
const ExaClient = (ExaModule as any).default ?? ExaModule;
const exa = env.EXA_API_KEY ? new ExaClient(env.EXA_API_KEY) : null;

app.log.info({
  whatsappAccessTokenConfigured: Boolean(env.WHATSAPP_ACCESS_TOKEN?.trim()),
  whatsappPhoneNumberIdConfigured: Boolean(env.WHATSAPP_PHONE_NUMBER_ID?.trim()),
  whatsappVerifyTokenConfigured: Boolean(env.WHATSAPP_VERIFY_TOKEN?.trim()),
  whatsappGraphVersion: env.WHATSAPP_GRAPH_VERSION
}, 'LUMIA environment diagnostics');

type AuthUser = { id: string; email: string; role: 'CUSTOMER'|'AGENT'|'TEACHER'|'ADMIN' };

async function token(user: AuthUser) {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' }).setSubject(user.id).setIssuedAt().setExpirationTime('7d').sign(secret);
}

async function auth(request: any, reply: any): Promise<AuthUser | null> {
  const value = request.headers.authorization;
  if (!value?.startsWith('Bearer ')) { reply.code(401).send({ error: 'Authentication required' }); return null; }
  try {
    const { payload } = await jwtVerify(value.slice(7), secret);
    return { id: String(payload.sub), email: String(payload.email), role: payload.role as AuthUser['role'] };
  } catch { reply.code(401).send({ error: 'Invalid or expired token' }); return null; }
}

await app.register(helmet);
await app.register(cors, { origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN });
await app.register(rateLimit, { max: 120, timeWindow: '1 minute' });

app.get('/', async () => ({
  status: 'ok',
  service: 'LUMIA AGENT PLATFORM API',
  message: 'LUMIA Agent Platform backend is running.',
  version: '1.0.0',
  health: '/health',
  api: '/api/v1'
}));

app.get('/health', async () => ({ status: 'ok', service: 'LUMIA AGENT PLATFORM', version: '1.0.0' }));

async function markWhatsAppRead(to: string, messageId?: string) {
  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID || !messageId) return;
  const url = `https://graph.facebook.com/${env.WHATSAPP_GRAPH_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', status: 'read', message_id: messageId })
    });
    if (!response.ok) app.log.warn({ status: response.status, detail: await response.text() }, 'WhatsApp read receipt failed');
  } catch (error) {
    app.log.warn({ error }, 'WhatsApp read receipt failed');
  }
}

async function sendWhatsAppText(to: string, body: string) {
  const accessToken = env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const missing: string[] = [];
  if (!accessToken) missing.push('WHATSAPP_ACCESS_TOKEN');
  if (!phoneNumberId) missing.push('WHATSAPP_PHONE_NUMBER_ID');
  if (missing.length) {
    throw new Error(`WhatsApp credentials are not configured: missing ${missing.join(', ')}`);
  }

  const url = `https://graph.facebook.com/${env.WHATSAPP_GRAPH_VERSION}/${phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body }
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`WhatsApp send failed (${response.status}): ${detail}`);
  }
}

async function notifyWhatsApp(phone: string | null | undefined, body: string) {
  if (!phone || !env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) return;
  try {
    await sendWhatsAppText(phone.replace(/\s/g, ''), body);
  } catch (error) {
    app.log.error({ error, phone }, 'WhatsApp notification failed');
  }
}

async function getWhatsAppSession(phone: string) {
  const normalizedPhone = phone.replace(/\D/g, '');
  const canonicalPhone = `+${normalizedPhone}`;
  const email = `wa-${normalizedPhone}@whatsapp.lumia.local`;

  let user = await db.user.findFirst({
    where: { OR: [{ phone }, { phone: canonicalPhone }, { email }] }
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email,
        phone: canonicalPhone,
        passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
        role: 'CUSTOMER'
      }
    });
  } else if (!user.phone) {
    user = await db.user.update({ where: { id: user.id }, data: { phone: canonicalPhone } });
  }

  let session = await db.session.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' }
  });

  if (!session) {
    session = await db.session.create({ data: { userId: user.id, title: 'WhatsApp chat' } });
  }

  return { user, session };
}

async function searchWeb(query: string) {
  if (!exa) return [];
  const response = await exa.search(query, { numResults: 5, type: 'auto', contents: { highlights: true } });
  return response.results.map((r: any) => ({
    title: r.title,
    url: r.url,
    publishedDate: r.publishedDate,
    text: r.highlights?.join('\n')?.slice(0, 2500) || ''
  }));
}

function needsWebSearch(message: string) {
  return /latest|today|now|current|recent|price|cost|news|2026|available|requirement|requirements|official|iremb|job|jobs|opportunit|website|who is|what is/i.test(message);
}


function cleanLumiaResponse(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1: $2')
    .replace(/https?:\/\/\S{90,}/g, (url) => {
      try {
        const parsed = new URL(url);
        const short = parsed.origin + parsed.pathname;
        return short.length <= 90 ? short + (parsed.search ? '?…' : '') : parsed.origin + '/…';
      } catch {
        return url;
      }
    })
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function generateLumiaReply(message: string, history: Array<{ role: 'user'|'assistant'; content: string }> = []) {
  if (!env.GROQ_API_KEY?.trim()) return 'LUMIA is temporarily unavailable. Please try again later.';

  let webContext = '';
  if (exa && needsWebSearch(message)) {
    const results = await searchWeb(message);
    if (results.length) {
      webContext = '\n\nWEB SOURCES FROM EXA:\n' + results.map((r: any, index: number) =>
        '[' + (index + 1) + '] ' + r.title + '\n' + r.url + '\n' + r.text
      ).join('\n\n');
    }
  }

  const prompt = [
    'You are LUMIA, an AI assistant for the LUMIA Agent Platform.',
    'Write clean plain text for WhatsApp and web chat.',
    'Do not use Markdown headings with #, ##, ### or asterisks for bold/italic.',
    'Do not wrap links in Markdown syntax.',
    'Keep answers compact and readable on a phone.',
    'Never reveal or name the internal AI model, provider, tool, agent, search engine, API, framework, or backend implementation used to produce the answer.',
    'Do not say that you used Groq, Exa, an Agent, a tool, a model, or any internal system. Present the response simply as LUMIA AI.',
    'Be concise, helpful, factual, and clear.',
    'When web context is provided, use it for current claims. Include a source URL only when it is useful to the customer; never mention the internal search tool or provider.',
    'For Irembo requirements or fees, prefer official Irembo sources and state uncertainty when verification is unavailable.',
    '',
    'CONVERSATION HISTORY:',
    ...history.slice(-12).map((item) => item.role.toUpperCase() + ': ' + item.content),
    'USER:',
    message,
    webContext
  ].join('\n');

  const models = env.GROQ_MODELS.split(',').map((model) => model.trim()).filter(Boolean);
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + env.GROQ_API_KEY.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 700
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        lastError = { status: response.status, payload };
        app.log.warn({ model, status: response.status, error: payload?.error }, 'Groq model failed; trying next model');
        if (![400, 401, 403, 404, 408, 409, 429, 500, 502, 503, 504].includes(response.status)) break;
        continue;
      }

      const text = payload?.choices?.[0]?.message?.content?.trim();
      if (text) {
        app.log.info({ model }, 'LUMIA Groq model succeeded');
        return text;
      }

      lastError = { status: 502, payload: { error: 'Empty Groq response' } };
    } catch (error: any) {
      lastError = error;
      app.log.warn({ model, errorMessage: error?.message ?? String(error) }, 'Groq request failed; trying next model');
    }
  }

  app.log.error({ models, lastError }, 'All configured Groq models failed');

  if (needsWebSearch(message) && exa) {
    const results = await searchWeb(message);
    if (results.length) {
      return 'Dore amakuru agezweho nabonye ku rubuga:\n\n' +
        results.map((r: any, i: number) => (i + 1) + '. ' + r.title + '\n' + r.text).join('\n\n') +
        '\n\nInkomoko: web search.';
    }
  }

  return 'LUMIA AI service iri gusubirwamo. Ongera ugerageze nyuma gato.';
}
const WHATSAPP_MENU = [
  ['services', 'Services zose'],
  ['irembo', 'Irembo Services'],
  ['website', 'Website Building'],
  ['hosting', 'Web Hosting'],
  ['tech', 'Teaching Tech'],
  ['prompts', 'Prompt Generation'],
  ['design', 'Flyer & Graphic Design'],
  ['jobs', 'Jobs for Seekers'],
  ['agents', 'Available Irembo Agents'],
  ['requests', 'My Requests']
] as const;

const LUMIA_SERVICE_CATALOG = [
  ['1', 'Hair Fashion'],
  ['2', 'Driving Training'],
  ['3', 'Restaurant Bookers'],
  ['4', 'Shopping Orders'],
  ['5', 'Car Repairing'],
  ['6', 'Motor Repairing'],
  ['7', 'Land Survey'],
  ['8', 'Computer Repairing'],
  ['9', 'Boutique Food Ordering'],
  ['10', 'Website Building'],
  ['11', 'Web Hosting'],
  ['12', 'Teaching Tech'],
  ['13', 'Prompt Generation'],
  ['14', 'Flyer & Graphic Design'],
  ['15', 'Jobs for Seekers']
] as const;

async function sendWhatsAppMenu(to: string) {
  const body = `LUMIA AI

Murakaza neza kuri LUMIA WhatsApp Agent.

Hitamo serivisi:

1. Hair Fashion
2. Driving Training
3. Restaurant Bookers
4. Shopping Orders
5. Car Repairing
6. Motor Repairing
7. Land Survey
8. Computer Repairing
9. Boutique Food Ordering
10. Website Building
11. Web Hosting
12. Teaching Tech
13. Prompt Generation
14. Flyer & Graphic Design
15. Jobs for Seekers
16. Irembo Services
17. Available Irembo Agents
18. My Requests

Andika nomero (urugero: 1) cyangwa izina rya service.`;
  await sendWhatsAppText(to, body);
}

function normalizeWhatsAppCommand(text: string) {
  return text.trim().toLowerCase()
    .replace(/^[#*\s]+|[#*\s]+$/g, '')
    .replace(/\s+/g, ' ');
}

async function getAvailableTeachers(technology?: string, location?: string) {
  const teachers = await db.teacher.findMany({
    where: {
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      ...(location ? { location: { contains: location, mode: 'insensitive' } } : {})
    },
    orderBy: { updatedAt: 'desc' },
    take: 20
  });
  return technology
    ? teachers.filter((teacher) =>
        teacher.technologies.some((item) => item.toLowerCase().includes(technology.toLowerCase()))
      )
    : teachers;
}

function formatTeacherList(teachers: any[]) {
  return teachers.map((teacher, index) =>
    `${index + 1}. ${teacher.displayName}\n📚 ${teacher.technologies.join(', ')}\n📍 ${teacher.location}`
  ).join('\n\n');
}

async function getWhatsAppIremboServices() {
  return db.iremboService.findMany({
    where: { active: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, category: true, feeRwf: true, processingTime: true, requirements: true, officialUrl: true }
  });
}

function formatRwf(value: number | null) {
  return value == null ? 'Igiciro ntikirashyirwaho; LUMIA irakigenzura.' : `${value.toLocaleString('en-US')} RWF`;
}

async function handleWhatsAppCommand(phone: string, user: any, text: string) {
  const command = normalizeWhatsAppCommand(text);

  const session = (await getWhatsAppSession(phone)).session;
  const platformServicePending = session.title?.match(/PLATFORM_SERVICE=([^|]+)/)?.[1] || null;
  const platformState = session.title?.match(/PLATFORM_STATE=([^|]+)/)?.[1] || null;

  if (platformState === 'AWAITING_DETAILS' && platformServicePending) {
    const service = await db.platformService.findUnique({ where: { slug: platformServicePending } });
    if (!service) {
      await db.session.update({ where: { id: session.id }, data: { title: 'WhatsApp chat' } });
      await sendWhatsAppText(phone, 'Iyo service ntikiboneka. Ongera uhitemo service.');
      return true;
    }
    const details = text.trim().replace(/^details\s*:\s*/i, '').trim();
    if (details.length < 5) {
      await sendWhatsAppText(phone, 'Andika DETAILS: ibisobanuro birambuye by ibyo ushaka.');
      return true;
    }
    const customerName = user.email.split('@')[0];
    const provider = await db.iremboAgent.findFirst({
      where: { status: 'ACTIVE', verificationStatus: 'VERIFIED', serviceAreas: { has: service.name } },
      orderBy: { updatedAt: 'desc' }
    });
    const providerRequest = await db.providerRequest.create({
      data: {
        customerId: user.id,
        serviceId: service.id,
        customerName,
        customerPhone: user.phone || phone,
        details,
        status: provider ? 'MATCHED' : 'PENDING',
        providerId: provider?.id
      }
    });
    if (provider) {
      await db.notification.create({ data: { userId: provider.userId, type: 'PROVIDER_SERVICE_REQUEST', title: 'New LUMIA service request', body: `Customer ${customerName} requested ${service.name}. Phone: ${user.phone || phone}. Details: ${details}` } });
      await notifyWhatsApp(provider.phone, `LUMIA SERVICE REQUEST\\n\\nService: ${service.name}\\nCustomer: ${customerName}\\nPhone: ${user.phone || phone}\\nDetails: ${details}\\n\\nRequest ID: ${providerRequest.id}`);
    }
    await db.session.update({ where: { id: session.id }, data: { title: 'WhatsApp chat' } });
    await sendWhatsAppText(phone, provider
      ? `Request yawe yakiriwe kandi ihujwe na ${provider.displayName}.\\nService: ${service.name}\\nStatus: MATCHED\\nRequest ID: ${providerRequest.id}`
      : `Request yawe yakiriwe. Nta provider verified uboneka kuri ${service.name} ubu; LUMIA izagushyira ku rutonde rwa PENDING.\\nRequest ID: ${providerRequest.id}`);
    return true;
  }

  const serviceIdPending = session.title?.match(/IREMBO_SERVICE_ID=([^|]+)/)?.[1] || null;
  const pendingAgentId = session.title?.match(/IREMBO_AGENT_ID=([^|]+)/)?.[1] || null;
  const pendingState = session.title?.match(/IREMBO_STATE=([^|]+)/)?.[1] || null;

  if (pendingState === 'AWAITING_NAME' && serviceIdPending && pendingAgentId) {
    const customerName = text.trim().replace(/^name\s*:\s*/i, '').trim();
    if (customerName.length < 2) {
      await sendWhatsAppText(phone, 'Nyandikira izina ryawe, urugero: NAME: Jean Mugisha');
      return true;
    }
    await db.session.update({
      where: { id: session.id },
      data: { title: `WhatsApp chat | IREMBO_SERVICE_ID=${serviceIdPending} | IREMBO_AGENT_ID=${pendingAgentId} | IREMBO_CUSTOMER_NAME=${customerName} | IREMBO_STATE=AWAITING_LOCATION` }
    });
    await sendWhatsAppText(phone, 'Murakoze. Noneho andika aho mutuye/aho ushaka ko serivisi ikorerwa, urugero: LOCATION: Kigali, Gasabo.');
    return true;
  }

  if (pendingState === 'AWAITING_LOCATION' && serviceIdPending && pendingAgentId) {
    const location = text.trim().replace(/^location\s*:\s*/i, '').trim();
    const customerName = session.title?.match(/IREMBO_CUSTOMER_NAME=([^|]+)/)?.[1] || phone;
    if (location.length < 2) {
      await sendWhatsAppText(phone, 'Andika location yawe, urugero: LOCATION: Kigali, Gasabo.');
      return true;
    }
    const service = await db.iremboService.findUnique({ where: { id: serviceIdPending } });
    const agent = await db.iremboAgent.findUnique({ where: { id: pendingAgentId } });
    if (!service || !agent) {
      await sendWhatsAppText(phone, 'Service cyangwa agent ntikiboneka. Ongera utangire ukoresheje Irembo.');
      return true;
    }
    const customer = await db.user.findUnique({ where: { id: user.id } });
    const phoneNumber = customer?.phone || phone;
    const request = await db.serviceRequest.create({
      data: {
        customerId: user.id,
        serviceId: service.id,
        customerName,
        customerPhone: phoneNumber,
        location,
        description: 'Irembo request started from LUMIA WhatsApp Agent',
        status: 'MATCHED',
        agentId: agent.id
      }
    });
    await db.notification.create({
      data: {
        userId: agent.userId,
        type: 'IREMBO_SERVICE_REQUEST',
        title: 'New WhatsApp Irembo request',
        body: `Customer ${customerName} requested ${service.name}. Phone: ${phoneNumber}. Location: ${location}.`
      }
    });
    await db.notification.create({
      data: {
        userId: user.id,
        type: 'IREMBO_AGENT_MATCHED',
        title: 'Agent selected',
        body: `${agent.displayName} will help you with ${service.name}.`
      }
    });
    await notifyWhatsApp(agent.phone, `LUMIA IREMBO REQUEST\n\nService: ${service.name}\nCustomer: ${customerName}\nPhone: ${phoneNumber}\nLocation: ${location}\n\nOpen LUMIA Agent Workspace or reply REQUESTS to manage it.`);
    await sendWhatsAppText(phone, `Request yawe yakiriwe neza.\n\nService: ${service.name}\nAgent: ${agent.displayName}\nStatus: MATCHED\n\nLUMIA izakumenyesha updates kuri WhatsApp.`);
    await db.session.update({ where: { id: session.id }, data: { title: 'WhatsApp chat' } });
    return true;
  }

  if (['hi','hello','muraho','mwaramutse','mwiriwe','start','menu','help'].includes(command)) {
    await sendWhatsAppMenu(phone);
    return true;
  }

  const menuMap: Record<string, string> = {
    '1': 'hair-fashion', 'hair fashion': 'hair-fashion', 'hair': 'hair-fashion', 'salon': 'hair-fashion',
    '2': 'driving-training', 'driving training': 'driving-training', 'driving': 'driving-training',
    '3': 'restaurant-bookers', 'restaurant bookers': 'restaurant-bookers', 'restaurant booking': 'restaurant-bookers',
    '4': 'shopping-orders', 'shopping orders': 'shopping-orders', 'shopping': 'shopping-orders',
    '5': 'car-repairing', 'car repairing': 'car-repairing', 'car repair': 'car-repairing',
    '6': 'motor-repairing', 'motor repairing': 'motor-repairing', 'motor repair': 'motor-repairing',
    '7': 'land-survey', 'land survey': 'land-survey', 'survey': 'land-survey', 'gupima ubutaka': 'land-survey',
    '8': 'computer-repairing', 'computer repairing': 'computer-repairing', 'computer repair': 'computer-repairing',
    '9': 'boutique-food-ordering', 'boutique food ordering': 'boutique-food-ordering', 'food ordering': 'boutique-food-ordering',
    '10': 'website', 'website': 'website', 'website building': 'website',
    '11': 'hosting', 'hosting': 'hosting', 'web hosting': 'hosting',
    '12': 'tech', 'teaching tech': 'tech',
    '13': 'prompts', 'prompt': 'prompts', 'prompt generation': 'prompts',
    '14': 'design', 'flyer': 'design', 'graphic design': 'design',
    '15': 'jobs', 'job': 'jobs', 'jobs for seekers': 'jobs',
    '16': 'irembo', 'irembo': 'irembo',
    '17': 'agents', 'available agents': 'agents',
    '18': 'requests', 'my requests': 'requests'
  };

  const selected = menuMap[command];

  const newServiceMessages: Record<string, string> = {
    'hair-fashion': 'HAIR FASHION\\n\\nShaka salon, hair styling, braiding, haircut cyangwa hair products. Andika ibyo ushaka n’aho uri; LUMIA izagufasha gutegura service request.',
    'driving-training': 'DRIVING TRAINING\\n\\nLUMIA ishobora kugufasha gushaka driving training, amasomo ya theory/practical n’aho wakorera training. Driving schools mu Rwanda zigengwa na RURA. Andika LOCATION yawe n’icyo wifuza kwiga.',
    'restaurant-bookers': 'RESTAURANT BOOKERS\\n\\nShaka restaurant, menu cyangwa reservation. Andika izina rya restaurant, location, itariki, igihe n’umubare w’abantu.',
    'shopping-orders': 'SHOPPING ORDERS\\n\\nShaka ibicuruzwa cyangwa utange order. Andika product ushaka, quantity, location yo kuyigezwaho n’uburyo bwo kuvugana nawe.',
    'car-repairing': 'CAR REPAIRING\\n\\nShaka umukanishi w’imodoka. Andika ikibazo cy’imodoka, model yayo n’aho uri.',
    'motor-repairing': 'MOTOR REPAIRING\\n\\nShaka umukanishi wa moto. Andika ikibazo cya moto, model yayo n’aho uri.',
    'land-survey': 'LAND SURVEY\\n\\nSerivisi yo gufata ibipimo no gufotora/kwerekana amakuru y’ubutaka. Andika location y’ubutaka n’icyo ushaka gukorerwa. LUMIA izaguhuza n’umupima ubutaka ubifitiye ububasha.',
    'computer-repairing': 'COMPUTER REPAIRING\\n\\nShaka technician wo gusana computer. Andika ikibazo cya computer, model niba uyizi n’aho uri.',
    'boutique-food-ordering': 'BOUTIQUE FOOD ORDERING\\n\\nOrder food cyangwa ibiribwa muri boutique/food shop. Andika ibyo ushaka, quantity na delivery location.'
  };

  if (selected && newServiceMessages[selected]) {
    const platformSlugMap: Record<string,string> = { website:'website-building', hosting:'web-hosting', tech:'teaching-tech', prompts:'prompt-generation', design:'flyer-graphic-design', jobs:'jobs-for-seekers' };
    const platformSlug = platformSlugMap[selected] || selected;
    await db.session.update({ where: { id: session.id }, data: { title: `WhatsApp chat | PLATFORM_SERVICE=${platformSlug} | PLATFORM_STATE=AWAITING_DETAILS` } });
    await sendWhatsAppText(phone, newServiceMessages[selected] + '\\n\\nAndika DETAILS: ibisobanuro birambuye kugirango dutegure request yawe.');
    return true;
  }

  if (selected === 'services') {
    await sendWhatsAppText(phone, `LUMIA SERVICES\n\n1. Hair Fashion\n2. Driving Training\n3. Restaurant Bookers\n4. Shopping Orders\n5. Car Repairing\n6. Motor Repairing\n7. Land Survey\n8. Computer Repairing\n9. Boutique Food Ordering\n10. Website Building\n11. Web Hosting\n12. Teaching Tech\n13. Prompt Generation\n14. Flyer & Graphic Design\n15. Jobs for Seekers\n\nAndika service ushaka. LUMIA izagufasha gutangira.`);
    return true;
  }

  if (selected === 'irembo') {
    if (user.role === 'AGENT') {
    const waAgent = await db.iremboAgent.findUnique({ where: { userId: user.id } });

    if (waAgent && ['agent requests', 'requests', 'agent'].includes(command)) {
      const requests = await db.serviceRequest.findMany({
        where: { agentId: waAgent.id, status: { in: ['MATCHED', 'ACCEPTED', 'IN_PROGRESS'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { service: true }
      });
      if (!requests.length) {
        await sendWhatsAppText(phone, 'Nta request nshya ufite ubu.');
      } else {
        await sendWhatsAppText(phone, `LUMIA AGENT REQUESTS\n\n${requests.map((r, i) => `${i + 1}. ${r.service.name}\nCustomer: ${r.customerName}\nPhone: ${r.customerPhone}\nStatus: ${r.status}`).join('\n\n')}\n\nKoresha ACCEPT 1, START 1 cyangwa COMPLETE 1.`);
      }
      return true;
    }

    const agentAction = command.match(/^(accept|start|complete|cancel)\s+(\d+)$/i);
    if (waAgent && agentAction) {
      const [, action, number] = agentAction;
      const index = Number(number) - 1;
      const requests = await db.serviceRequest.findMany({
        where: { agentId: waAgent.id, status: { in: ['MATCHED', 'ACCEPTED', 'IN_PROGRESS'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { service: true }
      });
      const requestRow = requests[index];
      if (!requestRow) {
        await sendWhatsAppText(phone, 'Iyo request ntibonetse. Andika REQUESTS kongera kureba requests.');
        return true;
      }
      const statusMap: Record<string, 'ACCEPTED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED'> = {
        accept: 'ACCEPTED', start: 'IN_PROGRESS', complete: 'COMPLETED', cancel: 'CANCELLED'
      };
      const nextStatus = statusMap[action.toLowerCase()];
      const updated = await db.serviceRequest.update({
        where: { id: requestRow.id },
        data: { status: nextStatus },
        include: { service: true, agent: true }
      });
      const statusText = nextStatus.replace('_', ' ').toLowerCase();
      await db.notification.create({
        data: {
          userId: updated.customerId,
          type: 'IREMBO_REQUEST_STATUS',
          title: 'Service request updated',
          body: `${updated.agent?.displayName || 'Your agent'} changed ${updated.service.name} to ${statusText}.`
        }
      });
      const customer = await db.user.findUnique({ where: { id: updated.customerId } });
      await notifyWhatsApp(customer?.phone, `LUMIA IREMBO UPDATE\n\nService: ${updated.service.name}\nAgent: ${updated.agent?.displayName || 'Agent'}\nStatus: ${statusText}`);
      await sendWhatsAppText(phone, `Request ${number}: ${updated.service.name}\nStatus: ${statusText}\nCustomer: ${updated.customerName}`);
      return true;
    }
  }

  const services = await getWhatsAppIremboServices();
    const groups = new Map<string, string[]>();
    for (const service of services) {
      const current = groups.get(service.category) || [];
      if (current.length < 12) current.push(service.name);
      groups.set(service.category, current);
    }
    const lines = Array.from(groups.entries()).slice(0, 18).map(([category, items]) =>
      `* ${category}\n${items.map((name, i) => `${i + 1}. ${name}`).join('\n')}`
    );
    await sendWhatsAppText(phone, `IREMBO SERVICES\n\n${lines.join('\n\n')}\n\nAndika izina rya service ushaka. LUMIA izakwereka ibisabwa, igiciro, igihe n'abakozi ba Available Agents.`);
    return true;
  }

  if (selected === 'agents') {
    const agents = await db.iremboAgent.findMany({
      where: { status: 'ACTIVE', verificationStatus: 'VERIFIED' },
      take: 10,
      orderBy: { updatedAt: 'desc' }
    });
    if (!agents.length) {
      await sendWhatsAppText(phone, 'Nta Available Irembo Agents bari muri LUMIA ubu. Gerageza nyuma.');
    } else {
      await sendWhatsAppText(phone, `AVAILABLE IREMBO AGENTS\n\n${agents.map((a, i) => `${i+1}. ${a.displayName}\n📍 ${a.location}\n📞 ${a.phone}\nServices: ${a.serviceAreas.slice(0,4).join(', ')}`).join('\n\n')}\n\nAndika izina rya service niba ushaka agent uyihuza na yo.`);
    }
    return true;
  }

  if (selected === 'requests') {
    if (user.role === 'AGENT') {
      const agentProfile = await db.iremboAgent.findUnique({ where: { userId: user.id } });
      if (!agentProfile) {
        await sendWhatsAppText(phone, 'Nta Agent profile ihujwe na account yawe. Banza wuzuze Agent registration muri LUMIA.');
        return true;
      }
      const requests = await db.serviceRequest.findMany({
        where: { agentId: agentProfile.id, status: { in: ['MATCHED', 'ACCEPTED', 'IN_PROGRESS'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { service: true }
      });
      if (!requests.length) {
        await sendWhatsAppText(phone, 'Nta request nshya ufite ubu.');
      } else {
        await sendWhatsAppText(phone, `LUMIA AGENT REQUESTS\n\n${requests.map((r, i) => `${i + 1}. ${r.service.name}\nCustomer: ${r.customerName}\nPhone: ${r.customerPhone}\nStatus: ${r.status}`).join('\n\n')}\n\nKoresha ACCEPT 1, START 1 cyangwa COMPLETE 1.`);
      }
      return true;
    }

    const requests = await db.serviceRequest.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { service: true, agent: true }
    });
    if (!requests.length) {
      await sendWhatsAppText(phone, 'Nta requests ufite muri LUMIA ubu.');
    } else {
      await sendWhatsAppText(phone, `MY REQUESTS\n\n${requests.map((r, i) => `${i+1}. ${r.service.name}\nStatus: ${r.status}\nAgent: ${r.agent?.displayName || 'Not assigned'}`).join('\n\n')}`);
    }
    return true;
  }

  if (selected === 'tech') {
    const teachers = await getAvailableTeachers();
    if (!teachers.length) {
      await sendWhatsAppText(phone, 'Nta Teacher verified uri available ubu. Ongera ugerageze nyuma.');
      return true;
    }
    const technologies = [...new Set(teachers.flatMap((teacher) => teacher.technologies))].slice(0, 20);
    await sendWhatsAppText(phone,
      `TEACHING TECH\n\nTechnologies ushobora kwiga:\n${technologies.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nAndika technology ushaka, urugero: Python, JavaScript cyangwa AI. LUMIA izakwereka Teachers available.`
    );
    return true;
  }

  if (selected === 'website' || selected === 'hosting' || selected === 'prompts' || selected === 'design' || selected === 'jobs') {
    const prompts: Record<string, string> = {
      website: 'Nshaka Website Building. Nsobanurira amahitamo, igiciro, ibyo nkeneye nuko watangira project.',
      hosting: 'Nshaka Web Hosting. Mpa plans, ibiciro, domain/hosting setup nintambwe zo gutangira.',
      prompts: 'Nshaka Prompt Generation. Mfashe gukora prompt nziza ijyanye n’akazi kanjye.',
      design: 'Nshaka Flyer & Graphic Design. Mfashe gutegura design yanjye n’ibisabwa.',
      jobs: 'Nshaka Jobs for Seekers. Mfashe gushaka opportunities no gutegura application.'
    };
    await sendWhatsAppText(phone, 'LUMIA SERVICE SELECTED\n\n' + prompts[selected] + '\n\nAndika ibisobanuro birambuye byibyo ushaka.');
    return true;
  }

  const teachers = await getAvailableTeachers();
  const teacherTechnology = teachers.find((teacher) =>
    teacher.technologies.some((item) =>
      item.toLowerCase() === command || item.toLowerCase().includes(command) || command.includes(item.toLowerCase())
    )
  );

  if (teacherTechnology || (teachers.length && /^(learn|kwiga|teach|teacher)\\s+/i.test(command))) {
    const requestedTechnology = command.replace(/^(learn|kwiga|teach|teacher)\\s+/i, '').trim();
    const matchingTeachers = requestedTechnology
      ? await getAvailableTeachers(requestedTechnology)
      : teachers;
    if (!matchingTeachers.length) {
      await sendWhatsAppText(phone, 'Nta Teacher verified uboneka kuri iyo technology ubu.');
      return true;
    }
    await sendWhatsAppText(phone,
      `AVAILABLE TEACHERS\\n\\n${formatTeacherList(matchingTeachers.slice(0, 8))}\\n\\nAndika TEACHER 1 kugirango uhitemo Teacher.`
    );
    await db.session.update({
      where: { id: session.id },
      data: { title: `WhatsApp chat | TEACHER_TECHNOLOGY=${requestedTechnology || teacherTechnology?.technologies[0] || 'Technology'}` }
    });
    return true;
  }

  const services = await getWhatsAppIremboServices();
  const matched = services.find(s => s.name.toLowerCase() === command || s.name.toLowerCase().includes(command) || command.includes(s.name.toLowerCase()));
  if (matched) {
    const requirements = matched.requirements
      ? JSON.stringify(matched.requirements).replace(/[{}"[\]]/g, '').slice(0, 1800)
      : 'Ibisabwa bizagenzurwa na LUMIA.';
    await sendWhatsAppText(phone,
      `IREMBO SERVICE\n\n${matched.name}\nCategory: ${matched.category}\nIgiciro: ${formatRwf(matched.feeRwf)}\nIgihe: ${matched.processingTime || 'LUMIA irakigenzura.'}\n\nIBISABWA:\n${requirements}\n\nNiba ushaka gukomeza, andika:\nAPPLY ${matched.name}\n\nLUMIA izagushakira Available Agents ikagufasha gutangira request.`
    );
    return true;
  }

  if (/^apply\s+/i.test(command)) {
    const serviceName = command.replace(/^apply\s+/i, '').trim();
    const matched = services.find(s => s.name.toLowerCase() === serviceName || s.name.toLowerCase().includes(serviceName));
    if (!matched) {
      await sendWhatsAppText(phone, 'Sinabonye iyo Irembo service. Andika Services cyangwa Irembo Services maze uhitemo service iri muri catalog.');
      return true;
    }
    const agents = await db.iremboAgent.findMany({
      where: { status: 'ACTIVE', verificationStatus: 'VERIFIED', serviceAreas: { has: matched.name } },
      take: 10
    });
    if (!agents.length) {
      await sendWhatsAppText(phone, `Nta verified agent wihariye kuri ${matched.name} uri muri LUMIA ubu. Ndakugira inama yo kugerageza Available Agents nyuma.`);
      return true;
    }
    await db.session.update({
      where: { id: (await getWhatsAppSession(phone)).session.id },
      data: { title: `WhatsApp chat | IREMBO_SERVICE_ID=${matched.id} | IREMBO_SERVICE=${matched.name}` }
    });
    await sendWhatsAppText(phone, `AVAILABLE AGENTS FOR ${matched.name}\n\n${agents.map((a, i) => `${i+1}. ${a.displayName}\n📍 ${a.location}\n📞 ${a.phone}`).join('\n\n')}\n\nAndika AGENT 1, AGENT 2, etc. kugirango uhitemo agent.`);
    return true;
  }

  const agentMatch = command.match(/^agent\s+(\d+)$/i);
  if (agentMatch) {
    const index = Number(agentMatch[1]) - 1;
    const session = (await getWhatsAppSession(phone)).session;
    const serviceId = session.title?.match(/IREMBO_SERVICE_ID=([^|]+)/)?.[1] || null;
    const serviceName = session.title?.match(/IREMBO_SERVICE=([^|]+)/)?.[1] || null;

    if (!serviceId) {
      await sendWhatsAppText(phone, 'Banza uhitemo Irembo service hanyuma wandike APPLY [service].');
      return true;
    }

    const agents = await db.iremboAgent.findMany({
      where: { status: 'ACTIVE', verificationStatus: 'VERIFIED', serviceAreas: { has: serviceName || '' } },
      take: 10,
      orderBy: { updatedAt: 'desc' }
    });
    const agent = agents[index];

    if (!agent) {
      await sendWhatsAppText(phone, 'Iyo agent ntabonetse kuri iyo service. Andika APPLY [service] kongera kubona Available Agents.');
      return true;
    }

    await db.session.update({
      where: { id: session.id },
      data: { title: `WhatsApp chat | IREMBO_SERVICE_ID=${serviceId} | IREMBO_AGENT_ID=${agent.id} | IREMBO_STATE=AWAITING_NAME` }
    });
    await sendWhatsAppText(phone, `Wahisemo ${agent.displayName} kuri ${serviceName}.\n\nMbere yo kohereza request, nyandikira izina ryawe:\nNAME: Izina ryawe`);
    return true;
  }
  return false;
}

app.get('/api/v1/whatsapp/webhook', async (request, reply) => {
  const q = z.object({ 'hub.mode': z.string().optional(), 'hub.verify_token': z.string().optional(), 'hub.challenge': z.string().optional() }).parse(request.query);
  if (q['hub.mode'] !== 'subscribe' || !env.WHATSAPP_VERIFY_TOKEN || q['hub.verify_token'] !== env.WHATSAPP_VERIFY_TOKEN) return reply.code(403).send({ error: 'Webhook verification failed' });
  return reply.type('text/plain').send(q['hub.challenge'] ?? '');
});

app.post('/api/v1/chat', async (request, reply) => {
  const user = await auth(request, reply);
  if (!user) return;

  const body = z.object({
    message: z.string().min(1).max(10000),
    sessionId: z.string().optional()
  }).parse(request.body);

  let session = body.sessionId
    ? await db.session.findFirst({ where: { id: body.sessionId, userId: user.id } })
    : await db.session.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' } });

  if (!session) {
    session = await db.session.create({
      data: { userId: user.id, title: body.message.slice(0, 80) }
    });
  }

  const history = await db.message.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'asc' },
    take: 12,
    select: { role: true, content: true }
  });

  await db.message.create({
    data: { sessionId: session.id, role: 'user', content: body.message }
  });

  const answer = await generateLumiaReply(body.message, history as Array<{ role: 'user' | 'assistant'; content: string }>);
  const assistantMessage = await db.message.create({
    data: { sessionId: session.id, role: 'assistant', content: cleanLumiaResponse(answer) }
  });

  return {
    sessionId: session.id,
    message: assistantMessage.content
  };
});

app.post('/api/v1/whatsapp/webhook', async (request, reply) => {
  const body = request.body as any;
  app.log.info({ whatsappWebhook: body }, 'WhatsApp webhook received');
  try {
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    const from = message?.from;
    const text = message?.text?.body;
    const messageId = message?.id;
    if (!from || !text) return reply.code(200).send({ received: true, ignored: true });

    const { session, user } = await getWhatsAppSession(from);
    await db.message.create({ data: { sessionId: session.id, role: 'user', content: text } });

    await markWhatsAppRead(from, messageId);

    const handled = await handleWhatsAppCommand(from, user, text);
    if (handled) {
      return reply.code(200).send({ received: true, replied: true, mode: 'service-menu' });
    }

    const answer = await generateLumiaReply(text, await db.message.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { role: true, content: true }
    }).then(items => items.reverse() as Array<{ role: 'user'|'assistant'; content: string }>));
    await db.message.create({ data: { sessionId: session.id, role: 'assistant', content: cleanLumiaResponse(answer) } });
    await sendWhatsAppText(from, cleanLumiaResponse(answer));

    return reply.code(200).send({ received: true, replied: true, mode: 'ai' });
  } catch (error) {
    app.log.error(error);
    return reply.code(200).send({ received: true, replied: false });
  }
});

app.post('/api/v1/auth/register', async (request, reply) => {
  const body = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().regex(/^\+?[0-9]{8,15}$/)
  }).parse(request.body);

  const email = body.email.toLowerCase();
  const exists = await db.user.findFirst({ where: { OR: [{ email }, { phone: body.phone }] } });
  if (exists) return reply.code(409).send({ error: 'Email or phone already registered' });

  const user = await db.user.create({
    data: {
      email,
      phone: body.phone,
      passwordHash: await bcrypt.hash(body.password, 12),
      role: 'CUSTOMER'
    }
  });

  return {
    token: await token({ id: user.id, email: user.email, role: user.role }),
    user: { id: user.id, email: user.email, phone: user.phone, role: user.role }
  };
});

app.post('/api/v1/auth/login', async (request, reply) => {
  const body = z.object({ email: z.string().email(), password: z.string() }).parse(request.body);
  const user = await db.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return reply.code(401).send({ error: 'Invalid email or password' });
  return { token: await token({ id: user.id, email: user.email, role: user.role }), user: { id: user.id, email: user.email, phone: user.phone, role: user.role } };
});

app.get('/api/v1/teachers', async (request) => {
  const q = z.object({ technology: z.string().optional(), location: z.string().optional() }).parse(request.query);
  const teachers = await getAvailableTeachers(q.technology, q.location);
  return {
    teachers: teachers.map(({ userId, ...teacher }) => teacher)
  };
});

app.post('/api/v1/teachers/register', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const body = z.object({
    displayName: z.string().min(2),
    phone: z.string().min(8),
    location: z.string().min(2),
    technologies: z.array(z.string().min(1)).min(1),
    bio: z.string().max(1000).optional()
  }).parse(request.body);

  const teacher = await db.teacher.upsert({
    where: { userId: user.id },
    update: body,
    create: { ...body, userId: user.id }
  });

  await db.user.update({
    where: { id: user.id },
    data: { role: 'TEACHER', phone: body.phone }
  });

  return { teacher };
});

app.post('/api/v1/teachers/:id/requests', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const body = z.object({
    technology: z.string().min(1),
    customerName: z.string().min(2),
    customerPhone: z.string().regex(/^\\+?[0-9]{8,15}$/),
    description: z.string().max(2000).optional(),
    location: z.string().max(200).optional()
  }).parse(request.body);

  const teacher = await db.teacher.findFirst({
    where: { id, status: 'ACTIVE', verificationStatus: 'VERIFIED' }
  });
  if (!teacher) return reply.code(404).send({ error: 'Teacher not available' });

  const supportsTechnology = teacher.technologies.some((item) =>
    item.toLowerCase().includes(body.technology.toLowerCase())
  );
  if (!supportsTechnology) return reply.code(400).send({ error: 'Teacher does not teach this technology' });

  const requestRow = await db.teacherRequest.create({
    data: {
      ...body,
      teacherId: teacher.id,
      customerId: user.id,
      status: 'PENDING'
    }
  });

  await db.notification.create({
    data: {
      userId: teacher.userId,
      type: 'TEACHER_SERVICE_REQUEST',
      title: 'New teaching request',
      body: `Customer ${body.customerName} wants to learn ${body.technology}. Phone: ${body.customerPhone}.`
    }
  });

  const customer = await db.user.findUnique({ where: { id: user.id } });
  const customerWaPhone = customer?.phone ?? (customer?.email.startsWith('wa-') ? customer.email.slice(3).split('@')[0] : null);
  await notifyWhatsApp(teacher.phone,
    `LUMIA TEACHING REQUEST\\n\\nTechnology: ${body.technology}\\nCustomer: ${body.customerName}\\nPhone: ${body.customerPhone}\\nLocation: ${body.location || 'Not provided'}`
  );
  if (customerWaPhone) {
    await notifyWhatsApp(customerWaPhone,
      `LUMIA TEACHING\\n\\nTeacher: ${teacher.displayName}\\nTechnology: ${body.technology}\\nStatus: PENDING`
    );
  }

  return { requestId: requestRow.id, status: requestRow.status };
});

app.get('/api/v1/irembo/services', async () => ({
  services: await db.iremboService.findMany({
    where: { active: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }]
  })
}));

app.get('/api/v1/irembo/services/:slug', async (request, reply) => {
  const { slug } = z.object({ slug: z.string() }).parse(request.params);
  const service = await db.iremboService.findFirst({
    where: { slug, active: true }
  });
  if (!service) return reply.code(404).send({ error: 'Irembo service not found' });

  const agents = await db.iremboAgent.findMany({
    where: {
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      serviceAreas: { has: service.name }
    },
    take: 20,
    orderBy: { updatedAt: 'desc' }
  });

  return {
    service,
    agents: agents.map(({ userId, ...agent }) => agent)
  };
});

app.get('/api/v1/irembo/service-requests', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const requests = await db.serviceRequest.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { service: true, agent: true }
  });
  return { requests };
});

app.get('/api/v1/irembo-agents/plans', async () => ({ plans: await db.agentPlan.findMany({ where: { active: true }, orderBy: { priceRwf: 'asc' } }) }));

app.get('/api/v1/irembo-agents', async (request) => {
  const q = z.object({ serviceType: z.string().optional(), location: z.string().optional() }).parse(request.query);
  const agents = await db.iremboAgent.findMany({ where: { status: 'ACTIVE', verificationStatus: 'VERIFIED', ...(q.location ? { location: { contains: q.location, mode: 'insensitive' } } : {}) }, include: { subscriptions: { where: { status: 'ACTIVE', expiresAt: { gt: new Date() } }, take: 1 } } });
  const filtered = q.serviceType ? agents.filter(a => a.serviceAreas.some(s => s.toLowerCase().includes(q.serviceType!.toLowerCase()))) : agents;
  return { agents: filtered.map(({ subscriptions, ...a }) => a) };
});

app.get('/api/v1/agent/requests', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  if (user.role !== 'AGENT' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Agent access required' });

  const agent = await db.iremboAgent.findUnique({ where: { userId: user.id } });
  if (!agent && user.role !== 'ADMIN') return reply.code(404).send({ error: 'Agent profile not found' });

  const requests = await db.serviceRequest.findMany({
    where: agent ? { agentId: agent.id } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { service: true, customer: true, agent: true }
  });

  return { requests };
});

app.post('/api/v1/agent/requests/:id/status', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  if (user.role !== 'AGENT' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Agent access required' });

  const { id } = z.object({ id: z.string() }).parse(request.params);
  const { status } = z.object({
    status: z.enum(['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  }).parse(request.body);

  const agent = await db.iremboAgent.findUnique({ where: { userId: user.id } });
  const existing = agent
    ? await db.serviceRequest.findFirst({ where: { id, agentId: agent.id }, include: { service: true } })
    : await db.serviceRequest.findUnique({ where: { id }, include: { service: true } });

  if (!existing) return reply.code(404).send({ error: 'Assigned request not found' });

  const updated = await db.serviceRequest.update({
    where: { id },
    data: { status },
    include: { service: true, agent: true }
  });

  const statusText = status.replace('_', ' ').toLowerCase();
  const statusBody = `${updated.agent?.displayName || 'Your agent'} changed ${existing.service.name} to ${statusText}.`;

  await db.notification.create({
    data: {
      userId: updated.customerId,
      type: 'IREMBO_REQUEST_STATUS',
      title: 'Service request updated',
      body: statusBody
    }
  });

  const customerUser = await db.user.findUnique({ where: { id: updated.customerId } });
  const customerWaPhone = customerUser?.phone ?? (customerUser?.email.startsWith('wa-') ? customerUser.email.slice(3).split('@')[0] : null);
  await notifyWhatsApp(
    customerWaPhone,
    `LUMIA IREMBO UPDATE\n\nService: ${existing.service.name}\nStatus: ${statusText}\nAgent: ${updated.agent?.displayName || 'Not assigned'}\n\nYour request status has been updated.`
  );

  if (updated.agent?.phone) {
    await notifyWhatsApp(
      updated.agent.phone,
      `LUMIA IREMBO\n\nRequest update: ${existing.service.name}\nCustomer: ${existing.customerName}\nStatus: ${statusText}\nCustomer phone: ${existing.customerPhone}`
    );
  }

  return { request: updated };
});

app.post('/api/v1/irembo-agents/register', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const body = z.object({
    displayName: z.string().min(2),
    phone: z.string().min(8),
    location: z.string().min(2),
    serviceAreas: z.array(z.string()).min(1),
    bio: z.string().max(1000).optional()
  }).parse(request.body);

  const agent = await db.iremboAgent.upsert({
    where: { userId: user.id },
    update: body,
    create: { ...body, userId: user.id }
  });

  if (user.role !== 'AGENT') {
    await db.user.update({ where: { id: user.id }, data: { role: 'AGENT', phone: body.phone } });
  } else {
    await db.user.update({ where: { id: user.id }, data: { phone: body.phone } });
  }

  return { agent };
});

app.post('/api/v1/irembo-agents/subscriptions', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const { planId } = z.object({ planId: z.string() }).parse(request.body);
  const agent = await db.iremboAgent.findUnique({ where: { userId: user.id } });
  if (!agent) return reply.code(404).send({ error: 'Agent profile not found' });
  const plan = await db.agentPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.active) return reply.code(404).send({ error: 'Plan not found' });
  const subscription = await db.agentSubscription.create({ data: { agentId: agent.id, planId: plan.id } });
  return { subscription, paymentRequired: true, message: 'Complete payment through the configured payment provider. Do not mark this paid from the client.' };
});

app.post('/api/v1/irembo/service-requests', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const body = z.object({
    serviceId: z.string(),
    customerName: z.string().min(2),
    customerPhone: z.string().regex(/^\+?[0-9]{8,15}$/),
    description: z.string().max(2000).optional(),
    location: z.string().max(200).optional()
  }).parse(request.body);

  const service = await db.iremboService.findUnique({ where: { id: body.serviceId } });
  if (!service) return reply.code(404).send({ error: 'Irembo service not found' });

  const requestRow = await db.serviceRequest.create({
    data: { ...body, customerId: user.id, status: 'PENDING' }
  });

  const agents = await db.iremboAgent.findMany({
    where: {
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      serviceAreas: { has: service.name }
    },
    take: 10
  });

  return {
    requestId: requestRow.id,
    status: requestRow.status,
    matchedAgents: agents.map(a => ({
      id: a.id,
      displayName: a.displayName,
      phone: a.phone,
      location: a.location,
      serviceAreas: a.serviceAreas
    }))
  };
});

app.post('/api/v1/irembo/service-requests/:id/choose-agent', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const { agentId } = z.object({ agentId: z.string() }).parse(request.body);

  const existing = await db.serviceRequest.findFirst({
    where: { id, customerId: user.id },
    include: { service: true }
  });
  if (!existing) return reply.code(404).send({ error: 'Service request not found' });

  const agent = await db.iremboAgent.findFirst({
    where: { id: agentId, status: 'ACTIVE', verificationStatus: 'VERIFIED' }
  });
  if (!agent) return reply.code(404).send({ error: 'Agent not available' });

  const updated = await db.serviceRequest.update({
    where: { id },
    data: { agentId, status: 'MATCHED' },
    include: { service: true, agent: true }
  });

  await db.notification.create({
    data: {
      userId: agent.userId,
      type: 'IREMBO_SERVICE_REQUEST',
      title: 'New Irembo service request',
      body: `Customer ${existing.customerName} requested ${existing.service.name}. Phone: ${existing.customerPhone}. Location: ${existing.location || 'Not provided'}.`
    }
  });

  await db.notification.create({
    data: {
      userId: user.id,
      type: 'IREMBO_AGENT_MATCHED',
      title: 'Agent selected',
      body: `${agent.displayName} has been selected to help with ${existing.service.name}.`
    }
  });

  await notifyWhatsApp(
    agent.phone,
    `LUMIA IREMBO REQUEST\n\nNew service request: ${existing.service.name}\nCustomer: ${existing.customerName}\nPhone: ${existing.customerPhone}\nLocation: ${existing.location || 'Not provided'}\n\nOpen your LUMIA Agent Workspace to accept or manage this request.`
  );

  const customerUser = await db.user.findUnique({ where: { id: user.id } });
  const customerWaPhone = customerUser?.email.startsWith('wa-') ? customerUser.email.slice(3).split('@')[0] : null;
  await notifyWhatsApp(
    customerWaPhone,
    `LUMIA IREMBO\n\nAgent selected: ${agent.displayName}\nService: ${existing.service.name}\nPhone: ${agent.phone}\nLocation: ${agent.location}\n\nThe agent can now assist you with your request.`
  );

  return { request: updated };
});


function requireAdmin(user: AuthUser, reply: any) {
  if (user.role !== 'ADMIN') {
    reply.code(403).send({ error: 'Admin access required' });
    return false;
  }
  return true;
}

const PLATFORM_SERVICES = [
  ['hair-fashion', 'Hair Fashion', 'Salon, hair styling, braiding, haircut and related services.'],
  ['driving-training', 'Driving Training', 'Driving theory and practical training.'],
  ['restaurant-bookers', 'Restaurant Bookers', 'Restaurant discovery, menu help and reservation requests.'],
  ['shopping-orders', 'Shopping Orders', 'Product discovery and customer purchase requests.'],
  ['car-repairing', 'Car Repairing', 'Car diagnostics and repair provider requests.'],
  ['motor-repairing', 'Motor Repairing', 'Motorcycle diagnostics and repair provider requests.'],
  ['land-survey', 'Land Survey', 'Land measurement and surveying provider requests.'],
  ['computer-repairing', 'Computer Repairing', 'Computer troubleshooting and repair provider requests.'],
  ['boutique-food-ordering', 'Boutique Food Ordering', 'Food and grocery ordering from listed providers.'],
  ['website-building', 'Website Building', 'Website design and development requests.'],
  ['web-hosting', 'Web Hosting', 'Website hosting and domain support requests.'],
  ['teaching-tech', 'Teaching Tech', 'Technology learning and teacher matching.'],
  ['prompt-generation', 'Prompt Generation', 'Professional AI prompt creation.'],
  ['flyer-graphic-design', 'Flyer & Graphic Design', 'Flyer and graphic design requests.'],
  ['jobs-for-seekers', 'Jobs for Seekers', 'Job opportunity discovery and application support.']
] as const;

async function ensurePlatformServices() {
  for (const [slug, name, description] of PLATFORM_SERVICES) {
    await db.platformService.upsert({ where: { slug }, update: { name, description, active: true }, create: { slug, name, description, active: true } });
  }
}

await ensurePlatformServices();
await ensureOfficialIremboCatalog();

app.get('/api/v1/platform/services', async () => {
  const existing = await db.platformService.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
  if (existing.length) return { services: existing };
  return { services: PLATFORM_SERVICES.map(([slug, name, description]) => ({ id: slug, slug, name, description, active: true })) };
});

app.post('/api/v1/partners/register', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const body = z.object({
    businessName: z.string().min(2).max(120),
    phone: z.string().regex(/^\\+?[0-9]{8,15}$/),
    location: z.string().min(2).max(200),
    description: z.string().max(1500).optional()
  }).parse(request.body);
  const partner = await db.partner.upsert({
    where: { userId: user.id },
    update: { ...body, status: 'PENDING' },
    create: { ...body, userId: user.id, status: 'PENDING' }
  });
  return { partner, message: 'Partner application submitted for admin review.' };
});

app.get('/api/v1/partners/me', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const partner = await db.partner.findUnique({ where: { userId: user.id }, include: { products: { orderBy: { createdAt: 'desc' } } } });
  if (!partner) return reply.code(404).send({ error: 'Partner profile not found' });
  return { partner };
});

app.post('/api/v1/partners/products', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const partner = await db.partner.findUnique({ where: { userId: user.id } });
  if (!partner || partner.status !== 'APPROVED') return reply.code(403).send({ error: 'Approved partner access required' });
  const body = z.object({
    name: z.string().min(2).max(160),
    category: z.string().min(2).max(100),
    description: z.string().max(2000).optional(),
    priceRwf: z.number().int().nonnegative().optional(),
    imageUrl: z.string().url().optional(),
    productUrl: z.string().url().optional(),
    stock: z.number().int().nonnegative().default(0)
  }).parse(request.body);
  const product = await db.product.create({ data: { ...body, partnerId: partner.id, status: body.stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK' } });
  return { product };
});

app.patch('/api/v1/partners/products/:id', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const partner = await db.partner.findUnique({ where: { userId: user.id } });
  if (!partner || partner.status !== 'APPROVED') return reply.code(403).send({ error: 'Approved partner access required' });
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const body = z.object({
    name: z.string().min(2).max(160).optional(),
    category: z.string().min(2).max(100).optional(),
    description: z.string().max(2000).optional(),
    priceRwf: z.number().int().nonnegative().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    productUrl: z.string().url().nullable().optional(),
    stock: z.number().int().nonnegative().optional(),
    status: z.enum(['DRAFT','ACTIVE','OUT_OF_STOCK','ARCHIVED']).optional()
  }).parse(request.body);
  const product = await db.product.findFirst({ where: { id, partnerId: partner.id } });
  if (!product) return reply.code(404).send({ error: 'Product not found' });
  const nextStock = body.stock ?? product.stock;
  const nextStatus = body.status ?? (nextStock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK');
  return { product: await db.product.update({ where: { id }, data: { ...body, status: nextStatus } }) };
});

app.get('/api/v1/marketplace/products', async (request) => {
  const q = z.object({ category: z.string().optional(), search: z.string().optional(), limit: z.coerce.number().int().min(1).max(100).default(50) }).parse(request.query);
  const products = await db.product.findMany({
    where: {
      status: 'ACTIVE',
      stock: { gt: 0 },
      ...(q.category ? { category: q.category } : {}),
      ...(q.search ? { OR: [{ name: { contains: q.search, mode: 'insensitive' } }, { description: { contains: q.search, mode: 'insensitive' } }, { category: { contains: q.search, mode: 'insensitive' } }] } : {})
    },
    orderBy: { createdAt: 'desc' },
    take: q.limit,
    include: { partner: { select: { id: true, businessName: true, phone: true, location: true } } }
  });
  return { products };
});

app.get('/api/v1/marketplace/products/:id', async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const product = await db.product.findFirst({
    where: { id, status: 'ACTIVE', stock: { gt: 0 } },
    include: { partner: { select: { id: true, businessName: true, phone: true, location: true, description: true } } }
  });
  if (!product) return reply.code(404).send({ error: 'Product not found' });
  return { product };
});

app.post('/api/v1/marketplace/orders', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const body = z.object({
    productId: z.string(),
    quantity: z.number().int().min(1).max(1000),
    customerName: z.string().min(2).max(120),
    customerPhone: z.string().regex(/^\\+?[0-9]{8,15}$/),
    deliveryLocation: z.string().min(2).max(300),
    notes: z.string().max(1000).optional()
  }).parse(request.body);
  const product = await db.product.findFirst({ where: { id: body.productId, status: 'ACTIVE', stock: { gte: body.quantity } }, include: { partner: true } });
  if (!product || product.partner.status !== 'APPROVED') return reply.code(409).send({ error: 'Product is not available for ordering' });
  const order = await db.$transaction(async (tx) => {
    const created = await tx.marketplaceOrder.create({
      data: {
        partnerId: product.partnerId,
        customerId: user.id,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        deliveryLocation: body.deliveryLocation,
        notes: body.notes,
        items: { create: { productId: product.id, quantity: body.quantity, unitPrice: product.priceRwf } }
      },
      include: { items: { include: { product: true } }, partner: true }
    });
    await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: body.quantity }, status: product.stock === body.quantity ? 'OUT_OF_STOCK' : 'ACTIVE' } });
    return created;
  });
  await db.notification.create({ data: { userId: product.partner.userId, type: 'MARKETPLACE_ORDER', title: 'New marketplace order', body: `Order from ${body.customerName}. Phone: ${body.customerPhone}. Product: ${product.name}. Quantity: ${body.quantity}. Delivery: ${body.deliveryLocation}.` } });
  await notifyWhatsApp(product.partner.phone, `LUMIA MARKETPLACE ORDER\\n\\nProduct: ${product.name}\\nQuantity: ${body.quantity}\\nCustomer: ${body.customerName}\\nPhone: ${body.customerPhone}\\nDelivery: ${body.deliveryLocation}\\n\\nOrder ID: ${order.id}`);
  return { orderId: order.id, status: order.status };
});

app.get('/api/v1/marketplace/orders', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const orders = await db.marketplaceOrder.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } }, partner: { select: { businessName: true, phone: true, location: true } } }
  });
  return { orders };
});

app.get('/api/v1/partner/orders', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const partner = await db.partner.findUnique({ where: { userId: user.id } });
  if (!partner) return reply.code(404).send({ error: 'Partner profile not found' });
  const orders = await db.marketplaceOrder.findMany({ where: { partnerId: partner.id }, orderBy: { createdAt: 'desc' }, include: { items: { include: { product: true } }, customer: { select: { id: true, email: true, phone: true } } } });
  return { orders };
});

app.patch('/api/v1/partner/orders/:id/status', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const partner = await db.partner.findUnique({ where: { userId: user.id } });
  if (!partner) return reply.code(404).send({ error: 'Partner profile not found' });
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const { status } = z.object({ status: z.enum(['CONFIRMED','PROCESSING','READY','COMPLETED','CANCELLED']) }).parse(request.body);
  const order = await db.marketplaceOrder.findFirst({ where: { id, partnerId: partner.id }, include: { items: { include: { product: true } }, partner: true } });
  if (!order) return reply.code(404).send({ error: 'Order not found' });
  const updated = await db.marketplaceOrder.update({ where: { id }, data: { status } });
  await db.notification.create({ data: { userId: order.customerId, type: 'MARKETPLACE_ORDER_STATUS', title: 'Order status updated', body: `Your order ${order.id} is now ${status}.` } });
  await notifyWhatsApp(order.customerPhone, `LUMIA ORDER UPDATE\\n\\nOrder: ${order.id}\\nStatus: ${status}\\nSeller: ${partner.businessName}`);
  return { order: updated };
});

app.get('/api/v1/provider/requests', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const provider = await db.iremboAgent.findUnique({ where: { userId: user.id } });
  if (!provider) return reply.code(404).send({ error: 'Provider profile not found' });
  return { requests: await db.providerRequest.findMany({ where: { providerId: provider.id }, orderBy: { createdAt: 'desc' }, include: { service: true, customer: { select: { email: true, phone: true } } } }) };
});

app.patch('/api/v1/provider/requests/:id/status', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const provider = await db.iremboAgent.findUnique({ where: { userId: user.id } });
  if (!provider) return reply.code(404).send({ error: 'Provider profile not found' });
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const { status } = z.object({ status: z.enum(['ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED']) }).parse(request.body);
  const existing = await db.providerRequest.findFirst({ where: { id, providerId: provider.id }, include: { service: true } });
  if (!existing) return reply.code(404).send({ error: 'Provider request not found' });
  const updated = await db.providerRequest.update({ where: { id }, data: { status } });
  await db.notification.create({ data: { userId: updated.customerId, type: 'PROVIDER_REQUEST_STATUS', title: 'Service request updated', body: `${provider.displayName} changed ${existing.service.name} to ${status}.` } });
  await notifyWhatsApp(updated.customerPhone, `LUMIA SERVICE UPDATE\\n\\nService: ${existing.service.name}\\nProvider: ${provider.displayName}\\nStatus: ${status}`);
  return { request: updated };
});

app.post('/api/v1/provider/requests', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const body = z.object({ serviceId: z.string(), customerName: z.string().min(2), customerPhone: z.string().regex(/^\\+?[0-9]{8,15}$/), details: z.string().min(5).max(3000), location: z.string().max(200).optional() }).parse(request.body);
  const service = await db.platformService.findUnique({ where: { id: body.serviceId } });
  if (!service) return reply.code(404).send({ error: 'Platform service not found' });
  const provider = await db.iremboAgent.findFirst({ where: { status:'ACTIVE', verificationStatus:'VERIFIED', serviceAreas:{has:service.name}, ...(body.location ? { location:{contains:body.location,mode:'insensitive'} } : {}) }, orderBy:{updatedAt:'desc'} });
  const created = await db.providerRequest.create({ data:{...body, customerId:user.id, providerId:provider?.id, status:provider?'MATCHED':'PENDING'} });
  if(provider) await notifyWhatsApp(provider.phone, `LUMIA SERVICE REQUEST\\n\\nService: ${service.name}\\nCustomer: ${body.customerName}\\nPhone: ${body.customerPhone}\\nDetails: ${body.details}\\nRequest ID: ${created.id}`);
  return { requestId: created.id, status: created.status, provider: provider ? { id:provider.id, displayName:provider.displayName, phone:provider.phone, location:provider.location } : null };
});

app.get('/api/v1/admin/overview', async (request, reply) => {
  const user = await auth(request, reply); if (!user || !requireAdmin(user, reply)) return;
  const [customers, agents, teachers, partners, products, orders, requests, messages] = await Promise.all([
    db.user.count({ where: { role: 'CUSTOMER' } }),
    db.iremboAgent.count(),
    db.teacher.count(),
    db.partner.count(),
    db.product.count(),
    db.marketplaceOrder.count(),
    db.serviceRequest.count(),
    db.message.count()
  ]);
  return { counts: { customers, agents, teachers, partners, products, orders, requests, messages } };
});

app.get('/api/v1/admin/agents', async (request, reply) => {
  const user = await auth(request, reply); if (!user || !requireAdmin(user, reply)) return;
  return { agents: await db.iremboAgent.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { email: true, phone: true } }, _count: { select: { requests: true } } } }) };
});

app.get('/api/v1/admin/teachers', async (request, reply) => {
  const user = await auth(request, reply); if (!user || !requireAdmin(user, reply)) return;
  return { teachers: await db.teacher.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { email: true, phone: true } }, _count: { select: { requests: true } } } }) };
});

app.get('/api/v1/admin/partners', async (request, reply) => {
  const user = await auth(request, reply); if (!user || !requireAdmin(user, reply)) return;
  return { partners: await db.partner.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { email: true, phone: true } }, _count: { select: { products: true, orders: true } } } }) };
});

app.patch('/api/v1/admin/partners/:id/status', async (request, reply) => {
  const user = await auth(request, reply); if (!user || !requireAdmin(user, reply)) return;
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const { status } = z.object({ status: z.enum(['APPROVED','REJECTED','SUSPENDED']) }).parse(request.body);
  const partner = await db.partner.update({ where: { id }, data: { status } });
  await db.notification.create({ data: { userId: partner.userId, type: 'PARTNER_STATUS', title: 'Partner application updated', body: `Your partner application is now ${status.toLowerCase()}.` } });
  await notifyWhatsApp(partner.phone, `LUMIA PARTNER\\n\\nBusiness: ${partner.businessName}\\nStatus: ${status}`);
  return { partner };
});

app.get('/api/v1/admin/products', async (request, reply) => {
  const user = await auth(request, reply); if (!user || !requireAdmin(user, reply)) return;
  return { products: await db.product.findMany({ orderBy: { createdAt: 'desc' }, include: { partner: { select: { businessName: true, status: true } } } }) };
});

app.get('/api/v1/admin/orders', async (request, reply) => {
  const user = await auth(request, reply); if (!user || !requireAdmin(user, reply)) return;
  return { orders: await db.marketplaceOrder.findMany({ orderBy: { createdAt: 'desc' }, include: { partner: { select: { businessName: true } }, customer: { select: { email: true, phone: true } }, items: { include: { product: true } } } }) };
});

app.get('/api/v1/admin/users', async (request, reply) => {
  const user = await auth(request, reply); if (!user || !requireAdmin(user, reply)) return;
  return { users: await db.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, email: true, phone: true, role: true, createdAt: true } }) };
});

app.get('/api/v1/admin/conversations', async (request, reply) => {
  const user = await auth(request, reply); if (!user || !requireAdmin(user, reply)) return;
  return { sessions: await db.session.findMany({ orderBy: { updatedAt: 'desc' }, take: 100, include: { user: { select: { email: true, phone: true } }, messages: { orderBy: { createdAt: 'asc' }, take: 50 } } }) };
});

app.patch('/api/v1/admin/agents/:id/status', async (request, reply) => {
  const user = await auth(request, reply); if (!user || !requireAdmin(user, reply)) return;
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const { status, verificationStatus } = z.object({
    status: z.enum(['PENDING','ACTIVE','SUSPENDED','REJECTED']).optional(),
    verificationStatus: z.enum(['PENDING','VERIFIED','REJECTED']).optional()
  }).refine((v) => v.status || v.verificationStatus, { message: 'Provide a status change' }).parse(request.body);
  const agent = await db.iremboAgent.update({ where: { id }, data: { ...(status ? { status } : {}), ...(verificationStatus ? { verificationStatus } : {}) } });
  return { agent };
});

app.patch('/api/v1/admin/teachers/:id/status', async (request, reply) => {
  const user = await auth(request, reply); if (!user || !requireAdmin(user, reply)) return;
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const { status, verificationStatus } = z.object({
    status: z.enum(['PENDING','ACTIVE','SUSPENDED','REJECTED']).optional(),
    verificationStatus: z.enum(['PENDING','VERIFIED','REJECTED']).optional()
  }).refine((v) => v.status || v.verificationStatus, { message: 'Provide a status change' }).parse(request.body);
  return { teacher: await db.teacher.update({ where: { id }, data: { ...(status ? { status } : {}), ...(verificationStatus ? { verificationStatus } : {}) } }) };
});

await registerBuilderRoutes(app);

app.setErrorHandler((error, _request, reply) => { app.log.error(error); reply.code(error.statusCode ?? 500).send({ error: error.message || 'Internal server error' }); });

await app.listen({ port: env.PORT, host: '0.0.0.0' });
