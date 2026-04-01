import { rollCompanion, RARITY_STARS } from './buddy.js';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const user = params?.user;
  if (!user) {
    return {
      title: 'Claude Code Buddy Preview',
      description: 'ASCII Companion Sprite Viewer — 18 species, gacha roll, share your buddy!',
    };
  }
  const c = rollCompanion(user);
  return {
    title: `${c.name} the ${c.species} — ${RARITY_STARS[c.rarity]} ${c.rarity.toUpperCase()}`,
    description: `I hatched ${c.name}! ${/^[aeiou]/i.test(c.rarity)?'An':'A'} ${c.rarity} ${c.species} companion from Claude Code Buddy.`,
    openGraph: {
      title: `${c.name} the ${c.species} — ${RARITY_STARS[c.rarity]} ${c.rarity.toUpperCase()}`,
      description: `I hatched ${c.name}! ${/^[aeiou]/i.test(c.rarity)?'An':'A'} ${c.rarity} ${c.species} companion from Claude Code Buddy.`,
      images: [`/api/og?user=${encodeURIComponent(user)}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${c.name} the ${c.species}`,
      description: `I hatched ${c.name}! ${/^[aeiou]/i.test(c.rarity)?'An':'A'} ${c.rarity} ${c.species} companion.`,
      images: [`/api/og?user=${encodeURIComponent(user)}`],
    },
  };
}

export default function Page() {
  // Redirect to the static app.html — Next.js serves OG meta, then client loads the app
  return (
    <html>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `window.location.replace('/app.html' + window.location.search)` }} />
      </body>
    </html>
  );
}
