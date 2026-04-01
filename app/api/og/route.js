import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { join } from 'path';
import { existsSync } from 'fs';

// Node.js runtime (not edge) for native canvas support
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Try to register a bundled font, fallback to system
const fontPath = join(process.cwd(), 'public', 'JetBrainsMono-Regular.ttf');
if (existsSync(fontPath)) {
  GlobalFonts.registerFromPath(fontPath, 'Mono');
}
const FONT = 'Mono, "JetBrains Mono", "Courier New", monospace';

// ── Buddy data (same Unicode chars as homepage) ──
const EYES=['·','✦','×','◉','@','°'];
const HATS_LIST=['none','crown','tophat','propeller','halo','wizard','beanie','tinyduck'];
const HAT_LINES={none:'',crown:'   \\^^^/    ',tophat:'   [___]    ',propeller:'    -+-     ',halo:'   (   )    ',wizard:'    /^\\     ',beanie:'   (___)    ',tinyduck:'    ,>      '};
const RARITIES=['common','uncommon','rare','epic','legendary'];
const RARITY_WEIGHTS={common:60,uncommon:25,rare:10,epic:4,legendary:1};
const RARITY_FLOOR={common:5,uncommon:15,rare:25,epic:35,legendary:50};
const RARITY_STARS={common:'★',uncommon:'★★',rare:'★★★',epic:'★★★★',legendary:'★★★★★'};
const STAT_NAMES=['DEBUGGING','PATIENCE','CHAOS','WISDOM','SNARK'];
const SPECIES_LIST=['duck','goose','blob','cat','dragon','octopus','owl','penguin','turtle','snail','ghost','axolotl','capybara','cactus','robot','rabbit','mushroom','chonk'];
const NAMES=['Mochi','Pixel','Nimbus','Biscuit','Sprout','Ziggy','Pebble','Tofu','Waffle','Cosmo','Pickle','Doodle','Widget','Nugget','Fizz','Maple','Ember','Luna','Pip','Sage','Socks','Orbit','Chai','Fern','Spark','Tater','Latte','Clover','Rune','Echo'];
const RARITY_COLORS={common:'#8b949e',uncommon:'#3fb950',rare:'#58a6ff',epic:'#bc8cff',legendary:'#d29922'};

const BODIES={
  duck:[[`            `,`    __      `,`  <({E} )___  `,`   (  ._>   `,`    \`--´    `]],
  goose:[[`            `,`     ({E}>    `,`     ||     `,`   _(__)_   `,`    ^^^^    `]],
  blob:[[`            `,`   .----.   `,`  ( {E}  {E} )  `,`  (      )  `,`   \`----´   `]],
  cat:[[`            `,`   /\\_/\\    `,`  ( {E}   {E})  `,`  (  ω  )   `,`  (")_(")   `]],
  dragon:[[`            `,`  /^\\  /^\\  `,` <  {E}  {E}  > `,` (   ~~   ) `,`  \`-vvvv-´  `]],
  octopus:[[`            `,`   .----.   `,`  ( {E}  {E} )  `,`  (______)  `,`  /\\/\\/\\/\\  `]],
  owl:[[`            `,`   /\\  /\\   `,`  (({E})({E}))  `,`  (  ><  )  `,`   \`----´   `]],
  penguin:[[`            `,`  .---.     `,`  ({E}>{E})     `,` /(   )\\    `,`  \`---´     `]],
  turtle:[[`            `,`   _,--._   `,`  ( {E}  {E} )  `,` /[______]\\ `,`  \`\`    \`\`  `]],
  snail:[[`            `,` {E}    .--.  `,`  \\  ( @ )  `,`   \\_\`--´   `,`  ~~~~~~~   `]],
  ghost:[[`            `,`   .----.   `,`  / {E}  {E} \\  `,`  |      |  `,`  ~\`~\`\`~\`~  `]],
  axolotl:[[`            `,`}~(______)~{`,`}~({E} .. {E})~{`,`  ( .--. )  `,`  (_/  \\_)  `]],
  capybara:[[`            `,`  n______n  `,` ( {E}    {E} ) `,` (   oo   ) `,`  \`------´  `]],
  cactus:[[`            `,` n  ____  n `,` | |{E}  {E}| | `,` |_|    |_| `,`   |    |   `]],
  robot:[[`            `,`   .[||].   `,`  [ {E}  {E} ]  `,`  [ ==== ]  `,`  \`------´  `]],
  rabbit:[[`            `,`   (\\__/)   `,`  ( {E}  {E} )  `,` =(  ..  )= `,`  (")__(")  `]],
  mushroom:[[`            `,` .-o-OO-o-. `,`(__________)`,`   |{E}  {E}|   `,`   |____|   `]],
  chonk:[[`            `,`  /\\    /\\  `,` ( {E}    {E} ) `,` (   ..   ) `,`  \`------´  `]],
};

function mulberry32(seed){let a=seed>>>0;return()=>{a|=0;a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};}
function hashString(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function rollRarity(rng){let roll=rng()*100;for(const r of RARITIES){roll-=RARITY_WEIGHTS[r];if(roll<0)return r;}return'common';}
function rollStats(rng,rarity){const floor=RARITY_FLOOR[rarity],peak=pick(rng,STAT_NAMES);let dump=pick(rng,STAT_NAMES);while(dump===peak)dump=pick(rng,STAT_NAMES);const stats={};for(const n of STAT_NAMES){if(n===peak)stats[n]=Math.min(100,floor+50+Math.floor(rng()*30));else if(n===dump)stats[n]=Math.max(1,floor-10+Math.floor(rng()*15));else stats[n]=floor+Math.floor(rng()*40);}return stats;}
function rollCompanion(userId){const rng=mulberry32(hashString(userId+'friend-2026-401')),rarity=rollRarity(rng);return{rarity,species:pick(rng,SPECIES_LIST),eye:pick(rng,EYES),hat:rarity==='common'?'none':pick(rng,HATS_LIST),shiny:rng()<0.01,stats:rollStats(rng,rarity),name:pick(rng,NAMES)};}

function renderSprite(species,eye,hat){
  const body=BODIES[species][0].map(l=>l.replaceAll('{E}',eye));
  const lines=[...body];
  if(hat!=='none'&&!lines[0].trim()) lines[0]=HAT_LINES[hat];
  if(!lines[0].trim()) lines.shift();
  return lines;
}

function renderBubble(text) {
  const words = text.split(' '), wrapped = [];
  let cur = '';
  for (const w of words) {
    if (cur.length + w.length + 1 > 26 && cur) { wrapped.push(cur); cur = w; }
    else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) wrapped.push(cur);
  const innerW = Math.max(...wrapped.map(l => l.length), 4);
  const lines = [];
  lines.push('╭' + '─'.repeat(innerW + 2) + '╮');
  for (const l of wrapped) lines.push('│ ' + l.padEnd(innerW) + ' │');
  lines.push('╰' + '─'.repeat(innerW + 2) + '╯');
  lines.push(' '.repeat(Math.min(5, innerW)) + '╲');
  lines.push(' '.repeat(Math.min(5, innerW) + 1) + '╲');
  return lines;
}

// ── Canvas drawing ──
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'anonymous';
    const c = rollCompanion(user);
    const color = RARITY_COLORS[c.rarity];
    const sprite = renderSprite(c.species, c.eye, c.hat);
    const bubble = renderBubble(`I'm ${c.name}'s gacha!`);

    const W = 1200, H = 630;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // ── Left side: bubble + sprite ──
    const leftCenterX = 300;
    const fontSize = 22;
    const lineH = fontSize * 1.4;
    ctx.font = `${fontSize}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Bubble (dim)
    let y = 60;
    ctx.fillStyle = '#8b949e';
    for (const line of bubble) {
      ctx.fillText(line, leftCenterX, y);
      y += lineH;
    }

    // Sprite (rarity color)
    y += 4;
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${FONT}`;
    for (const line of sprite) {
      ctx.fillText(line, leftCenterX, y);
      y += lineH;
    }

    // Name under sprite
    y += 8;
    ctx.fillStyle = color;
    ctx.font = `bold 20px ${FONT}`;
    ctx.fillText(c.name, leftCenterX, y);
    y += 28;
    ctx.fillStyle = '#8b949e';
    ctx.font = `14px ${FONT}`;
    ctx.fillText(`${c.species}  ${RARITY_STARS[c.rarity]} ${c.rarity.toUpperCase()}`, leftCenterX, y);

    // ── Right side: stats card ──
    const cardX = 560, cardY = 60, cardW = 580, cardH = 510;
    roundRect(ctx, cardX, cardY, cardW, cardH, 14);
    ctx.fillStyle = '#161b22';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Card title
    let cy = cardY + 30;
    ctx.textAlign = 'left';
    ctx.fillStyle = color;
    ctx.font = `bold 36px ${FONT}`;
    ctx.fillText((c.shiny ? '✨ ' : '') + c.name, cardX + 30, cy);
    cy += 46;
    ctx.fillStyle = '#8b949e';
    ctx.font = `18px ${FONT}`;
    ctx.fillText(`${c.species}  |  ${c.rarity.toUpperCase()}  ${RARITY_STARS[c.rarity]}`, cardX + 30, cy);
    cy += 40;

    // Divider
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 30, cy);
    ctx.lineTo(cardX + cardW - 30, cy);
    ctx.stroke();
    cy += 20;

    // Stats
    const barX = cardX + 140, barW = 300, barH = 16;
    for (const s of STAT_NAMES) {
      const v = c.stats[s];

      // Label
      ctx.fillStyle = '#8b949e';
      ctx.font = `14px ${FONT}`;
      ctx.fillText(s, cardX + 30, cy + 1);

      // Bar bg
      roundRect(ctx, barX, cy, barW, barH, 8);
      ctx.fillStyle = '#21262d';
      ctx.fill();

      // Bar fill
      const fillW = Math.max(8, Math.round((v / 100) * barW));
      roundRect(ctx, barX, cy, fillW, barH, 8);
      ctx.fillStyle = color;
      ctx.fill();

      // Value
      ctx.fillStyle = '#e6edf3';
      ctx.font = `14px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.fillText(String(v), cardX + cardW - 30, cy + 1);
      ctx.textAlign = 'left';

      cy += 36;
    }

    // Card footer
    cy = cardY + cardH - 40;
    ctx.strokeStyle = '#30363d';
    ctx.beginPath();
    ctx.moveTo(cardX + 30, cy);
    ctx.lineTo(cardX + cardW - 30, cy);
    ctx.stroke();
    cy += 14;
    ctx.fillStyle = '#484f58';
    ctx.font = `13px ${FONT}`;
    ctx.fillText('Claude Code Buddy Preview', cardX + 30, cy);
    ctx.textAlign = 'right';
    ctx.fillText('github.com/Zimins/buddy-preview', cardX + cardW - 30, cy);
    ctx.textAlign = 'left';

    // Output PNG
    const buf = canvas.toBuffer('image/png');
    return new Response(buf, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, immutable, max-age=31536000',
      },
    });
  } catch (e) {
    return new Response('Error: ' + e.message + '\n' + e.stack, { status: 500 });
  }
}
