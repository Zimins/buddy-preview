import { ImageResponse } from 'next/og';
import { rollCompanion, renderSprite, FACES, RARITY_STARS, RARITY_COLORS, STAT_NAMES } from '../../buddy.js';

export const runtime = 'edge';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'anonymous';
  const c = rollCompanion(user);
  const sprite = renderSprite(c.species, c.eye, c.hat);
  const face = FACES[c.species](c.eye);
  const color = RARITY_COLORS[c.rarity];
  const bar = (v) => '█'.repeat(Math.round(v / 100 * 14)) + '░'.repeat(14 - Math.round(v / 100 * 14));

  return new ImageResponse(
    (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        width: '100%', height: '100%', backgroundColor: '#0d1117', padding: '40px',
        fontFamily: 'monospace',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          border: `3px solid ${color}`, borderRadius: '16px',
          backgroundColor: '#161b22', padding: '32px', width: '520px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: '#8b949e', fontSize: '16px' }}>
            {`💬 "I'm ${c.name}'s gacha!"`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color, fontSize: '22px', lineHeight: '1.3', marginBottom: '16px' }}>
            {sprite.map((line, i) => (
              <div key={i} style={{ display: 'flex', whiteSpace: 'pre' }}>{line}</div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #30363d', paddingTop: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color, fontSize: '22px', fontWeight: 'bold' }}>{c.shiny ? '✨ ' : ''}{c.name}</div>
              <div style={{ color: '#8b949e', fontSize: '14px' }}>{c.species} {face}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ color, fontSize: '16px' }}>{RARITY_STARS[c.rarity]}</div>
              <div style={{ color, fontSize: '12px' }}>{c.rarity.toUpperCase()}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #30363d', paddingTop: '12px' }}>
            {STAT_NAMES.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', fontSize: '13px' }}>
                <div style={{ color: '#8b949e', width: '90px' }}>{s}</div>
                <div style={{ color, flex: 1 }}>{bar(c.stats[s])}</div>
                <div style={{ color: '#e6edf3', width: '30px', textAlign: 'right' }}>{c.stats[s]}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', color: '#8b949e', fontSize: '14px', marginTop: '16px' }}>
          🐾 Claude Code Buddy Preview
        </div>
      </div>
    ),
    { width: 600, height: 600 }
  );
}
