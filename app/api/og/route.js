import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// ── Inline buddy logic ──
const EYES=['*','*','x','@','@','o'];
const HATS_LIST=['none','crown','tophat','propeller','halo','wizard','beanie','tinyduck'];
const RARITIES=['common','uncommon','rare','epic','legendary'];
const RARITY_WEIGHTS={common:60,uncommon:25,rare:10,epic:4,legendary:1};
const RARITY_FLOOR={common:5,uncommon:15,rare:25,epic:35,legendary:50};
const STAT_NAMES=['DEBUGGING','PATIENCE','CHAOS','WISDOM','SNARK'];
const SPECIES_LIST=['duck','goose','blob','cat','dragon','octopus','owl','penguin','turtle','snail','ghost','axolotl','capybara','cactus','robot','rabbit','mushroom','chonk'];
const NAMES=['Mochi','Pixel','Nimbus','Biscuit','Sprout','Ziggy','Pebble','Tofu','Waffle','Cosmo','Pickle','Doodle','Widget','Nugget','Fizz','Maple','Ember','Luna','Pip','Sage','Socks','Orbit','Chai','Fern','Spark','Tater','Latte','Clover','Rune','Echo'];
const RARITY_COLORS={common:'#8b949e',uncommon:'#3fb950',rare:'#58a6ff',epic:'#bc8cff',legendary:'#d29922'};

const EMOJI_MAP={duck:'🦆',goose:'🪿',blob:'🫧',cat:'🐱',dragon:'🐉',octopus:'🐙',owl:'🦉',penguin:'🐧',turtle:'🐢',snail:'🐌',ghost:'👻',axolotl:'🦎',capybara:'🐾',cactus:'🌵',robot:'🤖',rabbit:'🐰',mushroom:'🍄',chonk:'🐈'};

function mulberry32(seed){let a=seed>>>0;return()=>{a|=0;a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};}
function hashString(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function rollRarity(rng){let roll=rng()*100;for(const r of RARITIES){roll-=RARITY_WEIGHTS[r];if(roll<0)return r;}return'common';}
function rollStats(rng,rarity){const floor=RARITY_FLOOR[rarity],peak=pick(rng,STAT_NAMES);let dump=pick(rng,STAT_NAMES);while(dump===peak)dump=pick(rng,STAT_NAMES);const stats={};for(const n of STAT_NAMES){if(n===peak)stats[n]=Math.min(100,floor+50+Math.floor(rng()*30));else if(n===dump)stats[n]=Math.max(1,floor-10+Math.floor(rng()*15));else stats[n]=floor+Math.floor(rng()*40);}return stats;}
function rollCompanion(userId){const rng=mulberry32(hashString(userId+'friend-2026-401')),rarity=rollRarity(rng);return{rarity,species:pick(rng,SPECIES_LIST),eye:pick(rng,EYES),hat:rarity==='common'?'none':pick(rng,HATS_LIST),shiny:rng()<0.01,stats:rollStats(rng,rarity),name:pick(rng,NAMES)};}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'anonymous';
    const c = rollCompanion(user);
    const color = RARITY_COLORS[c.rarity];
    const emoji = EMOJI_MAP[c.species] || '?';

    const statBars = STAT_NAMES.map(s => {
      const v = c.stats[s];
      const filled = Math.round(v / 100 * 12);
      const empty = 12 - filled;
      return { name: s, value: v, filled, empty };
    });

    return new ImageResponse(
      (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#0d1117', padding: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '3px solid ' + color, borderRadius: '16px', backgroundColor: '#161b22', padding: '32px 40px', width: '480px' }}>
            <div style={{ display: 'flex', fontSize: '80px', marginBottom: '8px' }}>{emoji}</div>
            <div style={{ display: 'flex', color: '#8b949e', fontSize: '16px', marginBottom: '16px' }}>{"I'm " + c.name + "'s gacha!"}</div>
            <div style={{ display: 'flex', fontSize: '28px', fontWeight: 'bold', color: color, marginBottom: '4px' }}>{c.name}</div>
            <div style={{ display: 'flex', color: '#8b949e', fontSize: '16px', marginBottom: '20px' }}>{c.species + ' | ' + c.rarity.toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', borderTop: '1px solid #30363d', paddingTop: '16px' }}>
              {statBars.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', color: '#8b949e', fontSize: '12px', width: '90px' }}>{s.name}</div>
                  <div style={{ display: 'flex', width: '200px', height: '10px', backgroundColor: '#21262d', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', width: (s.value * 2) + 'px', height: '10px', backgroundColor: color, borderRadius: '5px' }}></div>
                  </div>
                  <div style={{ display: 'flex', color: '#e6edf3', fontSize: '12px', width: '30px', marginLeft: '8px' }}>{String(s.value)}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', color: '#484f58', fontSize: '13px', marginTop: '16px' }}>Claude Code Buddy Preview</div>
        </div>
      ),
      { width: 600, height: 600 }
    );
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500 });
  }
}
