import { readFileSync } from 'fs';
import { join } from 'path';
import { rollCompanion, RARITY_STARS } from './buddy.js';

export async function generateMetadata({ searchParams }) {
  const user = searchParams?.user;
  if (!user) {
    return {
      title: 'Claude Code Buddy Preview',
      description: 'ASCII Companion Sprite Viewer — 18 species, gacha roll, share your buddy!',
    };
  }
  const c = rollCompanion(user);
  return {
    title: `${c.name} the ${c.species} — ${RARITY_STARS[c.rarity]} ${c.rarity.toUpperCase()}`,
    description: `I hatched ${c.name}! A ${c.rarity} ${c.species} companion from Claude Code Buddy.`,
    openGraph: {
      title: `${c.name} the ${c.species} — ${RARITY_STARS[c.rarity]} ${c.rarity.toUpperCase()}`,
      description: `I hatched ${c.name}! A ${c.rarity} ${c.species} companion from Claude Code Buddy.`,
      images: [`/api/og?user=${encodeURIComponent(user)}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${c.name} the ${c.species}`,
      description: `I hatched ${c.name}! A ${c.rarity} ${c.species} companion.`,
      images: [`/api/og?user=${encodeURIComponent(user)}`],
    },
  };
}

export default function Page() {
  const html = readFileSync(join(process.cwd(), 'public', 'index.html'), 'utf-8');
  // Extract just the body content (between <body> and </body>)
  // Actually, we serve the full HTML as a raw page
  return (
    <iframe
      srcDoc={html}
      style={{ width: '100vw', height: '100vh', border: 'none', position: 'fixed', top: 0, left: 0 }}
      title="Buddy Preview"
    />
  );
}
