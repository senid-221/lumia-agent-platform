import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import * as ExaModule from 'exa-js';
import { env } from './config.js';
import { db } from './db.js';

const app = Fastify({ logger: true });
const secret = new TextEncoder().encode(env.JWT_SECRET);
const gemini = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;
const ExaClient = (ExaModule as any).default ?? ExaModule;
const exa = env.EXA_API_KEY ? new ExaClient(env.EXA_API_KEY) : null;

type AuthUser = { id: string; email: string; role: 'CUSTOMER'|'AGENT'|'ADMIN' };

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

async function sendWhatsAppText(to: string, body: string) {
  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) throw new Error('WhatsApp credentials are not configured');
  const url = `https://graph.facebook.com/${env.WHATSAPP_GRAPH_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
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

async function getWhatsAppSession(phone: string) {
  const email = `wa-${phone.replace(/\D/g, '')}@whatsapp.lumia.local`;
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
        role: 'CUSTOMER'
      }
    });
  }
  let session = await db.session.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' } });
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

async function generateLumiaReply(message: string, history: Array<{ role: 'user'|'assistant'; content: string }> = []) {
  if (!gemini) return 'LUMIA is temporarily unavailable. Please try again later.';
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
    'Be concise, helpful, factual, and clear.',
    'When web context is provided, use it for current claims and include relevant source URLs.',
    'For Irembo requirements or fees, prefer official Irembo sources and state uncertainty when verification is unavailable.',
    '',
    'CONVERSATION HISTORY:',
    ...history.slice(-12).map((item) => `${item.role.toUpperCase()}: ${item.content}`),
    'CONVERSATION HISTORY:',
    ...history.slice(-12).map((item) => `${item.role.toUpperCase()}: ${item.content}`),
    'USER:',
    message,
    webContext
  ].join('\n');
  const response = await gemini.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: prompt
  });
  return response.text?.trim() || 'I could not generate a response right now.';
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
    data: { sessionId: session.id, role: 'assistant', content: answer }
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
    if (!from || !text) return reply.code(200).send({ received: true, ignored: true });

    const { session } = await getWhatsAppSession(from);
    await db.message.create({ data: { sessionId: session.id, role: 'user', content: text } });

    const answer = await generateLumiaReply(text);
    await db.message.create({ data: { sessionId: session.id, role: 'assistant', content: answer } });
    await sendWhatsAppText(from, answer);

    return reply.code(200).send({ received: true, replied: true });
  } catch (error) {
    app.log.error(error);
    return reply.code(200).send({ received: true, replied: false });
  }
});

app.post('/api/v1/auth/register', async (request, reply) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(8) }).parse(request.body);
  const exists = await db.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (exists) return reply.code(409).send({ error: 'Email already registered' });
  const user = await db.user.create({ data: { email: body.email.toLowerCase(), passwordHash: await bcrypt.hash(body.password, 12) } });
  return { token: await token({ id: user.id, email: user.email, role: user.role }), user: { id: user.id, email: user.email, role: user.role } };
});
app.post('/api/v1/auth/login', async (request, reply) => {
  const body = z.object({ email: z.string().email(), password: z.string() }).parse(request.body);
  const user = await db.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return reply.code(401).send({ error: 'Invalid email or password' });
  return { token: await token({ id: user.id, email: user.email, role: user.role }), user: { id: user.id, email: user.email, role: user.role } };
});

app.get('/api/v1/irembo/services', async () => ({ services: await db.iremboService.findMany({ where: { active: true }, orderBy: [{ category: 'asc' }, { name: 'asc' }] }) }));

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

  await db.notification.create({
    data: {
      userId: updated.customerId,
      type: 'IREMBO_REQUEST_STATUS',
      title: 'Service request updated',
      body: `${updated.agent?.displayName || 'Your agent'} changed ${existing.service.name} to ${status.replace('_', ' ').toLowerCase()}.`
    }
  });

  return { request: updated };
});

app.post('/api/v1/irembo-agents/register', async (request, reply) => {
  const user = await auth(request, reply); if (!user) return;
  const body = z.object({ displayName: z.string().min(2), phone: z.string().min(8), location: z.string().min(2), serviceAreas: z.array(z.string()).min(1), bio: z.string().max(1000).optional() }).parse(request.body);
  const agent = await db.iremboAgent.upsert({ where: { userId: user.id }, update: body, create: { ...body, userId: user.id } });
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

  return { request: updated };
});

app.setErrorHandler((error, _request, reply) => { app.log.error(error); reply.code(error.statusCode ?? 500).send({ error: error.message || 'Internal server error' }); });

await app.listen({ port: env.PORT, host: '0.0.0.0' });
