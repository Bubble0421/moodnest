/* 像素素材：全部为原创的字符画，运行时绘制成图片 */
const PAL = {
  k: '#3b2f2f', g: '#5a9e4b', G: '#3f7a3a', l: '#8fcf6a', y: '#f6d04d', Y: '#e0a526',
  o: '#f29a4a', O: '#c9702e', r: '#e2574c', R: '#b83c3c', p: '#f4a6c0', P: '#d9708f',
  v: '#a98bd8', V: '#7a5fb0', w: '#ffffff', W: '#e3ddd0', b: '#8b5a3c', B: '#5e3b28',
  u: '#6fa8dc', U: '#3d6fa3', c: '#eaa15f', C: '#b8723a', n: '#fbe3c4', s: '#c3c6c4',
  S: '#8a8f92', e: '#2b2b2b', m: '#d08a5a', M: '#9c5f35', h: '#ffe9a8',
};
const SOIL = ['....bbbb....', '..bbBbbBbb..'];

const PLANTS = {
  sunflower: { name: '向日葵', rows: ['....YYYY....', '...YyyyyY...', '..YyyBByyY..', '..YyBBBByY..', '..YyyBByyY..', '...YyyyyY...', '....YYYY....', '.....Gg.....', '..gg.Gg.....', '.gllgGg.....', '..ggGGg.gg..', '.....Gg.gllg', '.....GgGgg..', '.....Gg.....', ...SOIL] },
  tulip: { name: '郁金香', rows: ['............', '....r..r....', '...rRrrRr...', '...rrrrrr...', '...rrrrrr...', '....rrrr....', '.....gG.....', '.....gG.....', '..l..gG.....', '..lg.gG..l..', '...lggG.gl..', '....lgGgl...', '.....gG.....', '.....gG.....', ...SOIL] },
  lavender: { name: '薰衣草', rows: ['............', '.v...v...v..', 'vVv.vVv.vVv.', 'vVv.vVv.vVv.', 'vVv.vVv.vVv.', '.v...v...v..', '.g...g...g..', '.g...g...g..', '..g..g..g...', '..g..g..g...', '...g.g.g....', '...lgggl....', '....ggg.....', '....gG......', ...SOIL] },
  daisy: { name: '雏菊', rows: ['............', '...w....w...', '..wyw..wyw..', '...w....w...', '...g..w.g...', '...g.wyw.g..', '....g.w.g...', '..l.g.g.g...', '..lgg.g.gl..', '...lg.ggl...', '....ggGg....', '.....gG.....', '.....gG.....', '....gGGg....', ...SOIL] },
  cactus: { name: '小仙人掌', rows: ['............', '.....pp.....', '.....gg.....', '....glgg....', '.gg.glgg....', '.gl.glgg.gg.', '.glggglgglg.', '..gggglggg..', '.....glgg...', '.....glgg...', '.....glgg...', '...mmmmmm...', '...MmmmmM...', '....mmmm....', '....mmmm....', '....MMMM....'] },
  mushroom: { name: '小蘑菇', rows: ['............', '............', '............', '....rrrr....', '..rrwrrrrr..', '.rrrrrrwrrr.', '.rwrrrrrrrr.', '.RRRRRRRRRR.', '....nnnn....', '....nnnn....', '....nnnn....', '...nnnnn.r..', '..g.nnnn.rw.', '.glgnnnn.nn.', '.gggbbbbgnn.', '..bbBbbBbb..'] },
  fern: { name: '蕨草', rows: ['............', '.....g......', '....glg.....', '...g.g.g....', '..gl.g.lg...', '.gl..g..lg..', 'g...lgl...g.', '...gl.lg....', '..gl.g.lg...', '.g...g...g..', '....lgl.....', '...g.g.g....', '.....g......', '.....g......', ...SOIL] },
  rose: { name: '玫瑰丛', rows: ['............', '............', '...pP..rR...', '..pPPp.rRr..', '..pPP.GrRR..', '.GGpgGGGrgg.', 'GgggGlggGggG', 'gGrRggGgpPgg', 'gGrrRgglpPgG', '.ggGgGgggGg.', '..GggGggGg..', '...GgggggG..', '....GGGG....', '.....Gg.....', ...SOIL] },
  sapling: { name: '小树苗', rows: ['....gggg....', '..gglllggg..', '.glllggglgg.', '.gllgggggGg.', 'gglgggGgggGg', '.gggGggggGg.', '..GgggGgGG..', '...GGbBGG...', '.....bB.....', '.....bB.....', '.....bB.....', '.....bB.....', '....bbBB....', '....bbBB....', ...SOIL] },
  bluebell: { name: '风铃草', rows: ['............', '....u.......', '...uUu..u...', '...uuu.uUu..', '....U..uuu..', '....g...U...', '...g.g..g...', '..uUu.g.g...', '..uuu..gg...', '...U..g.....', '...g.g......', '....gg......', '....g.......', '....g.......', ...SOIL] },
};

const DECOS = {
  lantern: { name: '纸灯笼', rows: ['.....BB.....', '....rrrr....', '...rhhhhr...', '...rhyyhr...', '...rhyyhr...', '...rhhhhr...', '....rrrr....', '.....BB.....', '.....bb.....', '.....bb.....', '.....bb.....', '....bbbb....'] },
  bench: { name: '小木椅', rows: ['............', '............', 'bbbbbbbbbbbb', 'BBBBBBBBBBBB', 'bbbbbbbbbbbb', 'BBBBBBBBBBBB', '.B........B.', 'bbbbbbbbbbbb', 'BBBBBBBBBBBB', '.B........B.', '.B........B.', '.B........B.'] },
  birdbath: { name: '鸟浴盆', rows: ['............', '............', '.ssssssssss.', 'sSuuuuuuuuSs', '.sSSSSSSSSs.', '....ssss....', '.....ss.....', '.....ss.....', '.....ss.....', '....ssss....', '...SSSSSS...', '............'] },
  mailbox: { name: '小邮筒', rows: ['............', '...rrrrr....', '..rrrrrrr.R.', '..rwwwwrr.R.', '..rrrrrrr.r.', '..RRRRRRR...', '.....b......', '.....b......', '.....b......', '.....b......', '....bbb.....', '............'] },
  can: { name: '喷水壶', rows: ['............', '............', '....UUUU....', '...U....U...', '.u.uuuuuu...', '..uuuuuuuu..', '...uUuuuuu.u', '...uuuuuuuu.', '...uuuuuuu..', '...UUUUUUU..', '............', '............'] },
  stone: { name: '石灯', rows: ['.....SS.....', '...ssssss...', '..SSSSSSSS..', '....shhs....', '....shys....', '....ssss....', '...SSSSSS...', '.....ss.....', '.....ss.....', '....ssss....', '...SSSSSS...', '............'] },
  pumpkin: { name: '小南瓜', rows: ['............', '............', '.....Gb.....', '......b.....', '...oooooo...', '..oOoooOoo..', '.oOooOoooOo.', '.oOooOoooOo.', '.oOooOoooOo.', '..oOoooOoo..', '...oooooo...', '............'] },
};

const MISC = {
  seed: ['............', '............', '............', '............', '............', '............', '............', '............', '............', '............', '............', '............', '............', '.....bb.....', ...SOIL],
  sprout: ['............', '............', '............', '............', '............', '............', '............', '............', '............', '............', '....lg.gl...', '.....gg.....', '.....g......', '.....g......', ...SOIL],
  cat1: ['..........C...C.', '..........cC.Cc.', '..........ccccc.', '.c........cecec.', '.c........ccncc.', '..c........ccc..', '..cccccccccccc..', '..cCccCccCcccc..', '..cccccccccccc..', '..c.c......c.c..', '..C.C......C.C..', '................'],
  cat2: ['..........C...C.', '..........cC.Cc.', '..........ccccc.', 'c.........cecec.', '.c........ccncc.', '..c........ccc..', '..cccccccccccc..', '..cCccCccCcccc..', '..cccccccccccc..', '...c.c....c.c...', '...C.C....C.C...', '................'],
  catSleep: ['................', '................', '................', '................', '...........C..C.', '...........cCCc.', '...cccccccccccc.', '..cccCccCccckck.', '.ccccccccccccnc.', '.cCccccccccccccc', '.cccccccccccccc.', '..CCCCCCCCCCCC..'],
  cloud: ['......wwww..............', '....wwwwwwww....www.....', '..wwwwwwwwwwwwwwwwwww...', '.wwwwwwwwwwwwwwwwwwwwww.', 'WWWWWWWWWWWWWWWWWWWWWWWW', '.WWWWWWWWWWWWWWWWWWWWWW.'],
  house: ['....rr....', '...rRRr...', '..rRRRRr..', '.rRRRRRRr.', 'rRRRRRRRRr', '.nnnnnnnn.', '.nbbnnuun.', '.nbbnnuun.', '.nbbnnnnn.', '.BBBBBBBB.'],
  book: ['..........', '.uuuu.uuu.', 'uwwwwuwwwu', 'uWWWwuwWWu', 'uwwwwuwwwu', 'uWWWwuwWWu', 'uwwwwuwwwu', 'uWWwwuwWWu', '.uuuuuuuu.', '..........'],
  heart: ['..........', '.rrr..rrr.', 'rpprrrrrrr', 'rpprrrrrrr', 'rrrrrrrrrr', '.rrrrrrrr.', '..rrrrrr..', '...rrrr...', '....rr....', '..........'],
  rain: ['..........', '...wwww...', '.wwWWwwww.', 'wWWwwwwWww', 'wwwwwwwwww', '.WWWWWWWW.', '..u..u..u.', '.u..u..u..', '..u..u..u.', '.u..u..u..'],
  shoe: ['..........', '..........', '...rr.....', '...rrr....', '...rrrr...', '...rRrrrr.', '..rrrrrrrr', '.rrrrrrrrr', '.wwwwwwwww', '..........'],
  pencil: ['..........', '........pp', '.......yPp', '......yYy.', '.....yYy..', '....yYy...', '...yYy....', '..nYy.....', '..kn......', '..........'],
  leaf: ['..........', '......ggg.', '....gglllg', '...glllglg', '..gllglllg', '..glglllg.', '.gGlllgg..', '.G.ggg....', 'G.........', '..........'],
};

const _spriteCache = {};
function spriteURL(rows, scale = 4) {
  const key = rows.join('|') + scale;
  if (_spriteCache[key]) return _spriteCache[key];
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const c = document.createElement('canvas'); c.width = w * scale; c.height = h * scale;
  const x = c.getContext('2d');
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    if (PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect(i * scale, j * scale, scale, scale); }
  }));
  return (_spriteCache[key] = c.toDataURL());
}
const spriteSize = rows => ({ w: Math.max(...rows.map(r => r.length)), h: rows.length });
const icon = (name, cls = 'pxi') => `<img class="${cls}" src="${spriteURL(MISC[name])}" alt="">`;
