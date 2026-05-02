import { createHighlighter } from 'shiki';

const highlighterPromise = createHighlighter({
  themes: ['tokyo-night'],
  langs: ['http', 'json'],
});

export default defineEventHandler(async () => {
  const highlighter = await highlighterPromise;
  const highlightCode = (code: string, lang: 'http' | 'json') => highlighter.codeToHtml(code, {
  lang,
  theme: 'tokyo-night',
  });

  return {
    auth: highlightCode(`# REST API Header
X-API-Key: lf_live_xxxxxxxxxxxxxxxx

# Hosted UI Parameter
?api_key=lf_live_xxxxxxxxxxxxxxxx`, 'http'),
    requestBody: highlightCode(`{
  "faceDescriptor": [0.1, -0.2, ...],
  "email": "optional@limit.to"
}`, 'json'),
    responseBody: highlightCode(`{
  "identified": true,
  "user": {
    "email": "user@domain.com",
    "distance": 0.32
  }
}`, 'json'),
  };
});
