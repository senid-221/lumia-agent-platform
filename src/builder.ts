import type { FastifyInstance } from 'fastify';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import * as ExaModule from 'exa-js';
import { env } from './config.js';

const ExaClient = (ExaModule as any).default ?? ExaModule;
const exa = env.EXA_API_KEY ? new ExaClient(env.EXA_API_KEY) : null;
const secret = new TextEncoder().encode(env.JWT_SECRET);

type BuilderFile = { path: string; content: string; language: string };

function needsResearch(prompt: string) {
  return /research|latest|current|official|documentation|docs|api|library|framework|integration|reference/i.test(prompt);
}

async function research(query: string) {
  if (!exa) return [];
  const result = await exa.search(query, { numResults: 6, type: 'auto', contents: { highlights: true } });
  return result.results.map((item: any) => ({
    title: item.title,
    url: item.url,
    text: item.highlights?.join('\n').slice(0, 2200) || ''
  }));
}

function parseJson(text: string) {
  const fenced = text.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/i);
  const candidate = fenced?.[1] ?? text;
  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first < 0 || last < first) throw new Error('Builder returned invalid project data.');
  return JSON.parse(candidate.slice(first, last + 1));
}

function sanitizeFiles(value: any): BuilderFile[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((file) => file && typeof file.path === 'string' && typeof file.content === 'string')
    .slice(0, 40)
    .map((file) => ({
      path: file.path.replace(/^\/+/, '').replace(/\.\.(\/|\\)/g, ''),
      content: file.content,
      language: typeof file.language === 'string' ? file.language : 'text'
    }))
    .filter((file) => file.path && file.path.length < 180 && file.content.length < 300000);
}

export async function registerBuilderRoutes(app: FastifyInstance) {
  app.post('/api/v1/builder/generate', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return reply.code(401).send({ error: 'Authentication required' });

    try {
      await jwtVerify(authHeader.slice(7), secret);
    } catch {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }

    const body = z.object({
      prompt: z.string().min(10).max(12000),
      framework: z.enum(['nextjs', 'html', 'react']).default('nextjs'),
      style: z.enum(['minimal', 'modern', 'premium', 'bold']).default('modern')
    }).parse(request.body);

    if (!env.GROQ_API_KEY?.trim()) return reply.code(503).send({ error: 'LUMIA Builder AI is not configured.' });

    let sources: Array<{ title: string; url: string; text: string }> = [];
    if (needsResearch(body.prompt)) {
      try {
        sources = await research(body.prompt);
      } catch (error) {
        app.log.warn({ error }, 'Builder research failed; continuing without web context');
      }
    }

    const sourceContext = sources.length
      ? '\nRESEARCH CONTEXT:\n' + sources.map((s, i) => '[SOURCE ' + (i + 1) + '] ' + s.title + '\n' + s.url + '\n' + s.text).join('\n\n')
      : '';

    const frameworkRules = body.framework === 'html'
      ? 'Return a self-contained static website with index.html, styles.css and script.js when interaction needs JavaScript.'
      : body.framework === 'react'
        ? 'Return a clean React project using Vite-style structure with package.json, src/main.jsx and supporting files.'
        : 'Return a Next.js App Router project using TypeScript and Tailwind CSS. Include package.json and the minimum runnable app files.';

    const system = [
      'You are LUMIA Website Builder, a production-minded coding agent.',
      'Turn the user request into a real runnable website project, not a conversation or mockup.',
      frameworkRules,
      'Use semantic HTML, responsive layouts, accessible controls and clean component structure.',
      'Never put secrets, API keys, passwords or private tokens in generated files.',
      'If research context is supplied, use it to avoid stale APIs and cite relevant source URLs in project notes when useful.',
      'Return ONLY valid JSON with this shape: {"name":"string","summary":"string","files":[{"path":"string","language":"string","content":"string"}],"run":"string","notes":["string"]}',
      'The files array must contain complete file contents, not snippets.',
      'Keep the generated project reasonably small and coherent.'
    ].join('\n');

    const userPrompt = ['WEBSITE REQUEST:', body.prompt, '', 'DESIGN STYLE:', body.style, sourceContext].join('\n');
    const models = env.GROQ_MODELS.split(',').map((model) => model.trim()).filter(Boolean);
    let lastError: unknown = null;

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
            messages: [{ role: 'system', content: system }, { role: 'user', content: userPrompt }],
            temperature: 0.15,
            max_tokens: 12000
          })
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          lastError = payload;
          continue;
        }

        const raw = payload?.choices?.[0]?.message?.content;
        if (typeof raw !== 'string' || !raw.trim()) {
          lastError = new Error('Empty builder response');
          continue;
        }

        const parsed = parseJson(raw);
        const files = sanitizeFiles(parsed.files);
        if (!files.length) throw new Error('Builder returned no files.');

        return {
          name: typeof parsed.name === 'string' ? parsed.name : 'LUMIA Website',
          summary: typeof parsed.summary === 'string' ? parsed.summary : 'Generated website project.',
          framework: body.framework,
          style: body.style,
          files,
          run: typeof parsed.run === 'string' ? parsed.run : 'Install dependencies and start the project.',
          notes: Array.isArray(parsed.notes) ? parsed.notes.filter((x: unknown) => typeof x === 'string').slice(0, 10) : [],
          sources: sources.map(({ title, url }) => ({ title, url })),
          model
        };
      } catch (error) {
        lastError = error;
      }
    }

    app.log.error({ lastError }, 'All LUMIA Builder models failed');
    return reply.code(502).send({ error: 'LUMIA Builder could not generate the project right now. Please try again.' });
  });
}
