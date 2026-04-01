import { rollCompanion, RARITY_STARS } from './_buddy.js';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  const user = req.query.user || '';
  if (!user) {
    // No user param — serve static HTML
    const html = readFileSync(join(process.cwd(), 'public', 'index.html'), 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  const c = rollCompanion(user);
  const baseUrl = `https://${req.headers.host}`;
  const ogImageUrl = `${baseUrl}/api/og?user=${encodeURIComponent(user)}`;
  const pageUrl = `${baseUrl}/?user=${encodeURIComponent(user)}`;
  const title = `${c.name} the ${c.species} — ${RARITY_STARS[c.rarity]} ${c.rarity.toUpperCase()}`;
  const description = `I hatched ${c.name}! A ${c.rarity} ${c.species} companion from Claude Code Buddy.`;

  // Read the static HTML and inject OG meta tags
  let html = readFileSync(join(process.cwd(), 'public', 'index.html'), 'utf-8');

  const ogTags = `
    <meta property="og:type" content="website">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:image:width" content="600">
    <meta property="og:image:height" content="600">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${ogImageUrl}">
  `;

  html = html.replace('</head>', ogTags + '\n</head>');

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(html);
}
