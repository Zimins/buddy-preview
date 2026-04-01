// Shared buddy logic for server-side rendering
const EYES = ['·','✦','×','◉','@','°'];
const HATS_LIST = ['none','crown','tophat','propeller','halo','wizard','beanie','tinyduck'];
const HAT_LINES = { none:'', crown:'   \\^^^/    ', tophat:'   [___]    ', propeller:'    -+-     ', halo:'   (   )    ', wizard:'    /^\\     ', beanie:'   (___)    ', tinyduck:'    ,>      ' };
const RARITIES = ['common','uncommon','rare','epic','legendary'];
const RARITY_WEIGHTS = { common:60, uncommon:25, rare:10, epic:4, legendary:1 };
const RARITY_FLOOR = { common:5, uncommon:15, rare:25, epic:35, legendary:50 };
const RARITY_STARS = { common:'★', uncommon:'★★', rare:'★★★', epic:'★★★★', legendary:'★★★★★' };
const STAT_NAMES = ['DEBUGGING','PATIENCE','CHAOS','WISDOM','SNARK'];
const SPECIES_LIST = ['duck','goose','blob','cat','dragon','octopus','owl','penguin','turtle','snail','ghost','axolotl','capybara','cactus','robot','rabbit','mushroom','chonk'];
const NAMES = ['Mochi','Pixel','Nimbus','Biscuit','Sprout','Ziggy','Pebble','Tofu','Waffle','Cosmo','Pickle','Doodle','Widget','Nugget','Fizz','Maple','Ember','Luna','Pip','Sage','Socks','Orbit','Chai','Fern','Spark','Tater','Latte','Clover','Rune','Echo'];

const RARITY_COLORS = { common:'#8b949e', uncommon:'#3fb950', rare:'#58a6ff', epic:'#bc8cff', legendary:'#d29922' };

const BODIES = {
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

const FACES = {
  duck:(e)=>`(${e}>`, goose:(e)=>`(${e}>`, blob:(e)=>`(${e}${e})`, cat:(e)=>`=${e}ω${e}=`,
  dragon:(e)=>`<${e}~${e}>`, octopus:(e)=>`~(${e}${e})~`, owl:(e)=>`(${e})(${e})`,
  penguin:(e)=>`(${e}>)`, turtle:(e)=>`[${e}_${e}]`, snail:(e)=>`${e}(@)`,
  ghost:(e)=>`/${e}${e}\\`, axolotl:(e)=>`}${e}.${e}{`, capybara:(e)=>`(${e}oo${e})`,
  cactus:(e)=>`|${e}  ${e}|`, robot:(e)=>`[${e}${e}]`, rabbit:(e)=>`(${e}..${e})`,
  mushroom:(e)=>`|${e}  ${e}|`, chonk:(e)=>`(${e}.${e})`,
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a|=0; a=(a+0x6d2b79f5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return((t^(t>>>14))>>>0)/4294967296; };
}
function hashString(s) { let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
function pick(rng,arr) { return arr[Math.floor(rng()*arr.length)]; }
function rollRarity(rng) { let roll=rng()*100; for(const r of RARITIES){roll-=RARITY_WEIGHTS[r]; if(roll<0)return r;} return 'common'; }
function rollStats(rng, rarity) {
  const floor=RARITY_FLOOR[rarity], peak=pick(rng,STAT_NAMES); let dump=pick(rng,STAT_NAMES);
  while(dump===peak) dump=pick(rng,STAT_NAMES);
  const stats={};
  for(const n of STAT_NAMES) {
    if(n===peak) stats[n]=Math.min(100,floor+50+Math.floor(rng()*30));
    else if(n===dump) stats[n]=Math.max(1,floor-10+Math.floor(rng()*15));
    else stats[n]=floor+Math.floor(rng()*40);
  }
  return stats;
}

function rollCompanion(userId) {
  const rng = mulberry32(hashString(userId + 'friend-2026-401'));
  const rarity = rollRarity(rng);
  return {
    rarity, species: pick(rng, SPECIES_LIST), eye: pick(rng, EYES),
    hat: rarity === 'common' ? 'none' : pick(rng, HATS_LIST),
    shiny: rng() < 0.01, stats: rollStats(rng, rarity), name: pick(rng, NAMES),
  };
}

function renderSprite(species, eye, hat) {
  const body = BODIES[species][0].map(l => l.replaceAll('{E}', eye));
  const lines = [...body];
  if (hat !== 'none' && !lines[0].trim()) lines[0] = HAT_LINES[hat];
  if (!lines[0].trim()) lines.shift();
  return lines;
}

module.exports = {
  rollCompanion, renderSprite, FACES, RARITY_STARS, RARITY_COLORS,
  STAT_NAMES, NAMES, SPECIES_LIST,
};
