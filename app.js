/* 心晴 MoodNest v2 —— 像素小院版
 * 记录一种感受 → 小院长出一株植物 → 选一个适合当下的小行动 → 回看时有据可查
 * 纯前端：日记保存在本机浏览器；默认本地规则生成回应，可选接入大模型。
 */
'use strict';

// ======================= 感受与情境 =======================
const EXPR = [
  { id: 'good',    text: '今天还不错',   fam: 'pos',    color: '#F4C069' },
  { id: 'content', text: '有点小满足',   fam: 'pos',    color: '#F2A97E' },
  { id: 'warm',    text: '心里暖暖的',   fam: 'pos',    color: '#EE9C9C' },
  { id: 'calm',    text: '挺平静的',     fam: 'calm',   color: '#94C4A0' },
  { id: 'tired',   text: '累到不想动',   fam: 'tired',  color: '#BBA994' },
  { id: 'racing',  text: '脑子停不下来', fam: 'anx',    color: '#A796D6' },
  { id: 'tense',   text: '紧绷绷的',     fam: 'anx',    color: '#8FA0D8' },
  { id: 'heavy',   text: '心里堵堵的',   fam: 'low',    color: '#86A9CF' },
  { id: 'empty',   text: '空落落的',     fam: 'low',    color: '#A3B8C8' },
  { id: 'hurt',    text: '有点委屈',     fam: 'low',    color: '#CDA2BF' },
  { id: 'fire',    text: '一肚子火',     fam: 'anger',  color: '#E58D7C' },
  { id: 'unsure',  text: '说不清',       fam: 'unsure', color: '#CFC6BA' },
];
const EX = Object.fromEntries(EXPR.map(e => [e.id, e]));
const COMFY = ['pos', 'calm'], UNCOMFY = ['tired', 'anx', 'low', 'anger'];
const CTX_BASE = ['工作', '学业', '人际', '家人', '睡眠', '身体'];
const CTX_MORE = ['朋友', '恋爱', '金钱', '未来', '通勤', '天气', '饮食', '运动', '独处', '爱好', '自然', '网络'];
const INTENSITY = ['', '一点点', '有一些', '挺明显', '很强烈', '非常强烈'];
const JOURNAL_PROMPTS = ['发生了什么？', '身体有什么感觉？', '脑海里冒出的念头是…', '我现在最需要的是…'];

function tone(e) {
  const f = e.exprs.map(x => EX[x].fam);
  if (f.every(x => COMFY.includes(x))) return 'comfy';
  if (f.every(x => UNCOMFY.includes(x))) return 'unc';
  return 'mixed';
}
const mainFam = e => EX[e.exprs[0]].fam;

// ======================= 关怀练习 =======================
const PRACTICE = {
  breath478: { name: '4-7-8 呼吸', type: 'breath', phases: [{ t: '吸气', s: 4, sc: 1 }, { t: '屏住', s: 7, sc: 1 }, { t: '慢慢呼气', s: 8, sc: .55 }] },
  box: { name: '箱式呼吸', type: 'breath', phases: [{ t: '吸气', s: 4, sc: 1 }, { t: '屏住', s: 4, sc: 1 }, { t: '呼气', s: 4, sc: .55 }, { t: '停一下', s: 4, sc: .55 }] },
  grounding: { name: '5-4-3-2-1 着陆', type: 'steps', steps: [
    ['找一个舒服的姿势，轻轻做三次深呼吸。', 15], ['环顾四周，找出你能看到的 5 样东西。', 30], ['感受你能摸到的 4 样东西：衣服、椅子、脚下的地面……', 30],
    ['仔细听，找出 3 种声音。', 25], ['留意 2 种气味，哪怕很淡。', 20], ['感受 1 种味道，或者嘴里此刻的感觉。', 15], ['你已经回到了此时此地。', 12]] },
  bodyscan: { name: '身体扫描', type: 'steps', steps: [
    ['闭上眼睛，感受身体和椅子、地面接触的地方。', 25], ['注意额头和眉心，让它们舒展开。', 30], ['放松下巴，让舌头轻轻离开上颚。', 25],
    ['吸气时耸起肩膀，呼气时让它重重落下。', 35], ['留意胸口和腹部，随呼吸自然起伏。', 35], ['感受双手，想象有暖流从手心流过。', 30],
    ['双腿、双脚，稳稳地踩在地上。', 30], ['整个身体一起，轻轻呼吸。准备好了再睁开眼。', 30]] },
  compassion: { name: '自我关怀', type: 'steps', steps: [
    ['把一只手轻轻放在胸口，感受它的温度。', 15], ['对自己说：“这一刻真的很难受。”', 25], ['对自己说：“难受是生活的一部分，不只我一个人这样。”', 25],
    ['对自己说：“愿我能对自己温柔一点。”', 25], ['如果好朋友也经历这些，你会对 TA 说什么？把这句话也送给自己。', 30]] },
  walk: { name: '散步', type: 'steps', steps: [
    ['站起来，走出房间或走到窗边。', 30], ['放慢脚步，感受每一步脚掌落地。', 60], ['抬头看看天空，找一朵云或一片叶子。', 60],
    ['甩甩手臂，转转脖子。', 60], ['想一件今天还不错的小事，哪怕很小。', 60], ['做三次深呼吸，然后慢慢走回来。', 30]] },
  stretch: { name: '舒展', type: 'steps', steps: [
    ['头慢慢向右倾，停 15 秒，再换左边。', 30], ['双肩向后画圈 10 次，再向前 10 次。', 30], ['双手在背后交握，挺胸，手臂向上抬。', 25],
    ['右手举过头顶向左弯，停 15 秒，换边。', 30], ['伸直手臂，另一只手轻拉手指向后。', 25], ['最后，伸一个大大的懒腰。', 15]] },
  shake: { name: '抖一抖', type: 'steps', steps: [
    ['站起来，双脚与肩同宽。', 10], ['先抖动双手，像要甩掉水珠。', 20], ['加上手臂和肩膀，一起抖。', 20],
    ['膝盖也跟着弹起来，全身都在动。', 25], ['可以轻轻“哈”一声，把气呼出去。', 15], ['慢慢停下来，感受身体里的热度。', 20]] },
};
const SOUNDS = { rain: '雨声', forest: '林间鸟鸣', ocean: '海浪', wind: '微风', fire: '篝火' };
const WRITE_PROMPTS = [
  '今天有什么事，一直留在你心里？', '现在，你最希望得到什么？', '如果此刻的感受是一种天气，它会是什么样？',
  '今天有哪件事，你其实已经尽力了？', '写下今天三件还不错的小事，再小都可以。', '如果好朋友正经历你今天的事，你会对 TA 说什么？',
];

// 行动：一个具体的小事，由「时间 × 意愿」筛选
const ACTIONS = [
  { id: 'rain1',    kind: 'sound', sound: 'rain',   mins: 1,  want: 'quiet', ask: '先听一分钟雨声？', title: '听一分钟雨声', note: '不需要写东西，也不用离开座位。' },
  { id: 'rain3',    kind: 'sound', sound: 'rain',   mins: 3,  want: 'quiet', ask: '听一会儿雨声？', title: '听一会儿雨声', note: '不需要写东西，也不用离开座位。' },
  { id: 'forest10', kind: 'sound', sound: 'forest', mins: 10, want: 'quiet', ask: '在鸟鸣里待十分钟？', title: '在鸟鸣里待十分钟', note: '可以闭上眼，也可以就这样发呆。' },
  { id: 'ocean10',  kind: 'sound', sound: 'ocean',  mins: 10, want: 'quiet', ask: '听一会儿海浪？', title: '听海浪一来一回', note: '跟着浪的节奏，呼吸会慢慢放缓。' },
  { id: 'breath1',  kind: 'practice', ref: 'breath478', cycles: 2, mins: 1, want: 'quiet', ask: '做两轮 4-7-8 呼吸？', title: '做两轮 4-7-8 呼吸', note: '一分钟，让心跳慢下来一点。' },
  { id: 'box1',     kind: 'practice', ref: 'box', cycles: 4, mins: 1, want: 'quiet', ask: '试试箱式呼吸？', title: '箱式呼吸四轮', note: '吸、停、呼、停，各数四拍。' },
  { id: 'ground3',  kind: 'practice', ref: 'grounding', mins: 3, want: 'quiet', ask: '做一次 5-4-3-2-1 着陆？', title: '5-4-3-2-1 着陆练习', note: '用五感，把注意力带回此时此地。' },
  { id: 'body4',    kind: 'practice', ref: 'bodyscan', mins: 4, want: 'quiet', ask: '从头到脚放松一遍？', title: '从头到脚放松一遍', note: '身体松下来，心也会跟着松一点。' },
  { id: 'kind2',    kind: 'practice', ref: 'compassion', mins: 2, want: 'quiet', ask: '对自己说几句温柔的话？', title: '对自己说几句温柔的话', note: '像安慰好朋友那样，安慰一下自己。' },
  { id: 'shake2',   kind: 'practice', ref: 'shake', mins: 2, want: 'move', ask: '站起来抖一抖？', title: '站起来抖一抖', note: '把烦躁从身体里甩出去。' },
  { id: 'stretch3', kind: 'practice', ref: 'stretch', mins: 3, want: 'move', ask: '在座位旁舒展一下？', title: '在座位旁舒展一下', note: '肩颈、侧腰、手腕，都松一松。' },
  { id: 'walk5',    kind: 'practice', ref: 'walk', mins: 5, want: 'move', ask: '出去走五分钟？', title: '出去走五分钟', note: '换个环境，情绪也会跟着挪一挪。' },
  { id: 'write1',   kind: 'write', prompt: 1, mins: 1, want: 'write', ask: '写一句：现在最希望得到什么？', title: '写一句：现在最希望得到什么', note: '一句话就够，写完也可以不保存。' },
  { id: 'write3',   kind: 'write', prompt: 0, mins: 3, want: 'write', ask: '写写一直留在心里的事？', title: '写写一直留在心里的事', note: '不用组织语言，想到什么写什么。' },
  { id: 'good3',    kind: 'write', prompt: 4, mins: 3, want: 'write', ask: '写下三件还不错的小事？', title: '写下三件还不错的小事', note: '再小都可以，比如一杯热水。' },
];
const ACT = Object.fromEntries(ACTIONS.map(a => [a.id, a]));
const FAM_ACTIONS = {
  anx: ['rain1', 'breath1', 'rain3', 'ground3', 'box1', 'forest10'], anger: ['shake2', 'walk5', 'breath1', 'stretch3'],
  low: ['kind2', 'write3', 'walk5', 'rain3'], tired: ['rain1', 'stretch3', 'rain3', 'body4', 'forest10'],
  pos: ['good3', 'walk5', 'forest10'], calm: ['good3', 'body4', 'forest10'], unsure: ['rain1', 'write1', 'rain3', 'ground3', 'walk5'],
};
// 没有近期记录时的默认建议：门槛最低的几件事
const DEFAULT_ACTIONS = ['rain1', 'breath1', 'stretch3', 'write1', 'kind2', 'walk5'];
const WANT = { quiet: '想静静', move: '想动一动', write: '想写点什么' };
const FB = { better: '好一点', same: '差不多', worse: '更难受' };

// ======================= 存储 & 状态 =======================
const K = { entries: 'mn2_entries', care: 'mn2_care', dismiss: 'mn2_dismiss', sound: 'mn2_sound', ai: 'mn_ai' };
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

let db = { entries: [], care: [], dismiss: [] };
const state = { mode: 'mine', tab: 'garden', sub: 'list', range: 7, filter: null, expanded: false, arrange: false, careQuick: null };

function loadMine() {
  db = { entries: load(K.entries, null), care: load(K.care, []), dismiss: load(K.dismiss, []) };
  if (!db.entries) db.entries = migrateV1();
}
function persist() { if (state.mode !== 'mine') return; save(K.entries, db.entries); save(K.care, db.care); save(K.dismiss, db.dismiss); }

function migrateV1() {
  const old = load('mn_entries', []);
  const emap = { happy: 'good', calm: 'calm', grateful: 'warm', tired: 'tired', anxious: 'racing', sad: 'heavy', angry: 'fire', wronged: 'hurt' };
  const cmap = { 家庭: '家人', 美食: '饮食' };
  const list = old.filter(o => emap[o.emotion]).map(o => ({
    id: o.id, ts: o.ts, exprs: [emap[o.emotion]], intensity: o.intensity || 3,
    ctx: (o.triggers || []).map(t => cmap[t] || t), text: o.text || '', plant: randPlant(o.id), reply: o.reply,
  }));
  if (list.length) save(K.entries, list);
  return list;
}

// ======================= 工具函数 =======================
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => { d = new Date(d); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pick = a => a[Math.floor(Math.random() * a.length)];
const hash = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const randPlant = seed => { const k = Object.keys(PLANTS); return k[seed ? hash(seed) % k.length : Math.floor(Math.random() * k.length)]; };
function period(h) { return h < 5 ? '凌晨' : h < 11 ? '早上' : h < 13 ? '中午' : h < 18 ? '下午' : '晚上'; }
function fmtTime(ts) {
  const d = new Date(ts), today = ymd(Date.now()), yest = ymd(Date.now() - 864e5);
  const day = ymd(d) === today ? '今天' : ymd(d) === yest ? '昨天' : `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${day}${period(d.getHours())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}
function openSheet(id) { $(id).classList.add('show'); document.body.classList.add('lock'); }
function closeSheet(id) { $(id).classList.remove('show'); if (!document.querySelector('.sheet-mask.show')) document.body.classList.remove('lock'); }
document.querySelectorAll('.sheet-mask').forEach(m => m.addEventListener('click', e => {
  if (e.target !== m) return;
  if (m.id === 'player-mask') stopPlayer();
  closeSheet('#' + m.id);
}));
function entriesIn(n) {
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (n - 1));
  return db.entries.filter(e => e.ts >= start.getTime());
}
const exprChip = id => `<span class="xchip" style="--c:${EX[id].color}">${EX[id].text}</span>`;

// ======================= 声音（Web Audio 实时合成） =======================
let AC = null;
function ac() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; }
const _noise = {};
function noiseBuf(type) {
  if (_noise[type]) return _noise[type];
  const ctx = ac(), len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (type === 'brown') { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
    else if (type === 'pink') { b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852; b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926; }
    else d[i] = w;
  }
  return (_noise[type] = buf);
}
function startSound(kind, vol = .6) {
  const ctx = ac(), out = ctx.createGain(), timers = [], nodes = [];
  out.gain.setValueAtTime(0, ctx.currentTime); out.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.2); out.connect(ctx.destination);
  const filt = (type, f, q = 1) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const gain = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const loop = (type, ...chain) => { const s = ctx.createBufferSource(); s.buffer = noiseBuf(type); s.loop = true; let n = s; chain.forEach(c => { n.connect(c); n = c; }); n.connect(out); s.start(); nodes.push(s); };
  const lfo = (freq, depth, param) => { const o = ctx.createOscillator(), g = gain(depth); o.frequency.value = freq; o.connect(g).connect(param); o.start(); nodes.push(o); };
  const burst = (dur, f, level, type = 'bandpass') => {
    const s = ctx.createBufferSource(), g = ctx.createGain(), b = filt(type, f, 1.2), t = ctx.currentTime;
    s.buffer = noiseBuf('white'); g.gain.setValueAtTime(level, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(b).connect(g).connect(out); s.start(t, Math.random() * 3, dur + .02);
  };
  const chirp = () => {
    const t0 = ctx.currentTime, base = 2400 + Math.random() * 1400, n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = t0 + i * .16;
      o.frequency.setValueAtTime(base, t); o.frequency.exponentialRampToValueAtTime(base * 1.45, t + .06); o.frequency.exponentialRampToValueAtTime(base * .9, t + .12);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .13);
      o.connect(g).connect(out); o.start(t); o.stop(t + .15);
    }
  };
  if (kind === 'rain') {
    loop('pink', filt('highpass', 350), filt('lowpass', 5000), gain(.55));
    timers.push(setInterval(() => { if (Math.random() < .5) burst(.015 + Math.random() * .02, 2500 + Math.random() * 3500, .12 + Math.random() * .15); }, 45));
  } else if (kind === 'ocean') {
    const g = gain(.5); loop('brown', filt('lowpass', 1100), g); lfo(.085, .42, g.gain);
  } else if (kind === 'wind') {
    const b = filt('bandpass', 420, .7); loop('brown', b, gain(.9)); lfo(.11, 260, b.frequency);
  } else if (kind === 'fire') {
    loop('brown', filt('lowpass', 520), gain(.7));
    timers.push(setInterval(() => { if (Math.random() < .28) burst(.004 + Math.random() * .018, 1800 + Math.random() * 3000, .2 + Math.random() * .35, 'highpass'); }, 60));
  } else if (kind === 'forest') {
    const b = filt('bandpass', 380, .6); loop('brown', b, gain(.35)); lfo(.07, 150, b.frequency);
    const sched = () => { chirp(); timers.push(setTimeout(sched, 1500 + Math.random() * 3500)); }; sched();
  }
  return {
    setVol(v) { out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(v, ctx.currentTime, .1); },
    stop() {
      timers.forEach(t => { clearInterval(t); clearTimeout(t); });
      out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(0, ctx.currentTime, .3);
      setTimeout(() => { nodes.forEach(n => { try { n.stop(); } catch {} }); out.disconnect(); }, 1500);
    },
  };
}
function chime() {
  if (!soundOn) return;
  const ctx = ac(), t = ctx.currentTime;
  [[784, 0], [1047, .12], [1319, .24]].forEach(([f, d]) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t + d); g.gain.exponentialRampToValueAtTime(.12, t + d + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d + .6);
    o.connect(g).connect(ctx.destination); o.start(t + d); o.stop(t + d + .7);
  });
}
let soundOn = load(K.sound, false), ambient = null;
const player = { timer: null, sound: null };
function syncSound() {
  const b = $('#btn-sound');
  b.innerHTML = soundOn ? '🔊' : '🔈';
  b.setAttribute('aria-label', soundOn ? '关闭小院声音' : '打开小院声音');
  b.classList.toggle('on', soundOn);
  if (soundOn && !ambient && !player.sound && AC) ambient = startSound('forest', .18);
  if ((!soundOn || player.sound) && ambient) { ambient.stop(); ambient = null; }
}

// ======================= 本地回应引擎 =======================
const REPLY = {
  pos: ['喵～能感觉到你此刻轻快了一些。这份好感受，我帮你种在小院里了。', '真好呀。记下来吧，低落的时候可以回来看看它。'],
  calm: ['平静的时候，连风都是慢的。好好享受这一会儿。', '能在忙碌里留出一点平静，你照顾自己照顾得很好。'],
  tired: ['辛苦了。累不是软弱，是身体在提醒你该停一停了。', '先别急着要求自己。允许自己慢一点、歇一会儿。'],
  anx: ['脑子转个不停的时候，心也跟着被揪紧了吧。你愿意停下来记一笔，已经是在松开一点了。', '我听到了你的不安。它常常说明你很在乎，这份在乎本身没有错。'],
  low: ['心里堵着的时候，不用急着好起来。我就在旁边陪着你。', '这种感觉很沉，对吧。你不需要一个人扛着它。'],
  anger: ['火气上来是很正常的，它常常在说：有些边界被碰到了。', '感受到你的火气了。先让这股劲儿有个出口，再决定要怎么做。'],
  unsure: ['说不清也没关系。感受有时候就像一团毛线，我们先把它放在这里，不急着拆开。', '不知道是什么感觉，也是一种真实的状态。谢谢你愿意停下来看看自己。'],
};
const CTX_LINE = {
  工作: '工作的事容易悄悄堆起来。可以分一分：哪些是你能控制的，哪些不是？',
  学业: '学业压力大的时候，把大目标拆成今天能完成的一小步，会轻一些。',
  人际: '和人相处的事最耗心力。你的感受是合理的，不必全都归到自己身上。',
  家人: '和家人之间的情绪往往更复杂，因为在乎和期待交织在一起。',
  睡眠: '睡不好会把所有感受都放大一点。今晚可以试试早些放下手机。',
  身体: '身体不舒服时，情绪低一点很正常，先好好照顾身体。',
  未来: '对未来的担心常常来自不确定。试着只看接下来 24 小时能做的一件事。',
  金钱: '钱的压力很现实。把担心写成具体的清单，会比在脑子里打转更有掌控感。',
};
const DISTORTIONS = [
  { name: '以偏概全', re: /总是|永远|每次|从来|一直都|所有人|没有人/, tip: '真的每一次都这样吗？也许能找到一个例外。' },
  { name: '往最坏处想', re: /完了|完蛋|肯定会|搞砸|毁了|没救|彻底失败/, tip: '最坏的情况一定会发生吗？就算发生了，你会怎么应对？' },
  { name: '“应该”思维', re: /应该|必须|不得不|本该/, tip: '把“我应该”换成“我希望”，感受一下有什么不同。' },
  { name: '给自己贴标签', re: /我就是个|我真没用|废物|失败者|我好差|我太笨|一无是处/, tip: '一件事没做好，不等于你这个人不好。' },
  { name: '猜别人的想法', re: /肯定觉得|一定认为|都觉得我|讨厌我|看不起我|嫌弃我/, tip: '有没有证据说明对方真的这么想？还有别的可能吗？' },
];
const CRISIS_RE = /不想活|想死|去死|自杀|轻生|结束生命|活着没意思|活着没有意义|伤害自己|自残|割腕|跳楼/;

function localReply(e) {
  const parts = [pick(REPLY[mainFam(e)])];
  if (e.exprs.length > 1 && tone(e) === 'mixed') parts.push('好几种感受同时在，这很正常，累和满足本来就可以一起存在。');
  const c = e.ctx.find(x => CTX_LINE[x]);
  if (c && tone(e) !== 'comfy') parts.push(CTX_LINE[c]);
  return parts.join('\n\n');
}

// ======================= 大模型（可选） =======================
const aiCfg = () => load(K.ai, { provider: 'none', key: '', model: '', base: '' });
const PROVIDER_NAME = { deepseek: 'DeepSeek', openai: 'OpenAI 兼容接口', claude: 'Claude' };
async function callLLM(system, user) {
  const c = aiCfg();
  if (c.provider === 'none' || !c.key) throw new Error('未配置');
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    if (c.provider === 'claude') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', signal: ctrl.signal,
        headers: { 'content-type': 'application/json', 'x-api-key': c.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: c.model || 'claude-sonnet-5', max_tokens: 900, system, messages: [{ role: 'user', content: user }] }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return (await r.json()).content.map(x => x.text || '').join('').trim();
    }
    const base = (c.base || (c.provider === 'deepseek' ? 'https://api.deepseek.com' : 'https://api.openai.com/v1')).replace(/\/$/, '');
    const r = await fetch(base + '/chat/completions', {
      method: 'POST', signal: ctrl.signal, headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + c.key },
      body: JSON.stringify({ model: c.model || (c.provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini'), temperature: .8, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return (await r.json()).choices[0].message.content.trim();
  } finally { clearTimeout(timer); }
}
const SYS_REPLY = `你是「心晴」小院里一只叫“小晴”的猫，也是一位温柔、懂一点心理学（CBT 与自我关怀）的陪伴者。
用户刚记下一条感受。请用中文回复 60~120 字：先具体地接住 TA 的感受（不说教、不空泛安慰）；如果想法里有明显的认知偏差，用温柔的提问引导换个角度；不要给诊断，也不要列清单。可以偶尔用“喵”，但别太多。`;
async function genReply(e) {
  const user = `感受：${e.exprs.map(x => EX[x].text).join('、')}（程度：${INTENSITY[e.intensity]}）\n可能相关：${e.ctx.join('、') || '不确定'}\n写下的话：${e.text || '（没有写）'}`;
  try { return { text: await callLLM(SYS_REPLY, user), src: 'ai:' + aiCfg().provider }; }
  catch (err) { return { text: localReply(e), src: 'local', err: aiCfg().provider !== 'none' ? err.message : '' }; }
}
const srcLabel = src => src && src.startsWith('ai') ? `由 ${PROVIDER_NAME[src.split(':')[1]] || '大模型'} 生成` : '本地规则生成';

// ======================= 小院 =======================
const GW = 160, COLS = [14, 36, 58, 102, 124, 146], TOP = 40, ROWH = 24, CAP = 18;
let catCtl = null;

function gardenLayout() {
  const sorted = db.entries.slice().sort((a, b) => a.ts - b.ts);
  const shown = state.expanded ? sorted : sorted.slice(-CAP);
  const rows = state.expanded ? Math.max(3, Math.ceil(sorted.length / 6)) : 3;
  const H = TOP + rows * ROWH + 26;
  const plants = shown.map(e => {
    const idx = sorted.indexOf(e), slot = state.expanded ? idx : idx % CAP;
    const r = Math.floor(slot / 6), c = slot % 6, j = hash(e.id);
    let x = COLS[c] + (j % 5) - 2, b = TOP + (r + 1) * ROWH - 3 + (j % 3);
    if (e.pos) { x = e.pos.x; b = Math.min(H - 2, e.pos.b); }
    return { kind: 'plant', id: e.id, rows: PLANTS[e.plant].rows, x, b };
  });
  const decoSlots = [...COLS.map(x => [x, 37]), ...COLS.map(x => [x, H - 4])];
  const decos = db.care.filter(c => c.deco && !c.deco.hidden).sort((a, b) => a.ts - b.ts).map((c, i) => {
    let [x, b] = decoSlots[i] || [12 + hash(c.id) % 136, TOP + 10 + hash(c.id + 'y') % (H - TOP - 20)];
    if (c.deco.pos) { x = c.deco.pos.x; b = Math.min(H - 2, c.deco.pos.b); }
    return { kind: 'deco', id: c.id, rows: DECOS[c.deco.type].rows, x, b };
  });
  return { H, items: [...plants, ...decos], total: sorted.length };
}

function drawGround(cv, H) {
  const S = 4; cv.width = GW * S; cv.height = H * S;
  const x = cv.getContext('2d');
  const px = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a * S, b * S, w * S, h * S); };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  px(0, 0, GW, H, '#86c46d');
  for (let i = 0; i < GW * H / 9; i++) px(Math.floor(rnd() * GW), Math.floor(rnd() * H), 1, 1, rnd() < .5 ? '#78b660' : '#97d27c');
  for (let i = 0; i < 40; i++) { const a = Math.floor(rnd() * GW), b = 16 + Math.floor(rnd() * (H - 18)); if (a > 66 && a < 94) continue; px(a, b, 1, 2, '#6aa955'); px(a + 1, b + 1, 1, 1, '#6aa955'); }
  const flowerC = ['#ffffff', '#f6d04d', '#f4a6c0', '#c9b6f0'];
  for (let i = 0; i < 26; i++) { const a = Math.floor(rnd() * GW), b = 18 + Math.floor(rnd() * (H - 20)); if (a > 64 && a < 96) continue; px(a, b, 1, 1, flowerC[i % 4]); }
  // 小路
  px(70, 12, 20, H - 12, '#d8c49b');
  for (let b = 14, k = 0; b < H; b += 7, k++) { const o = k % 2 ? 0 : 3; px(71 + o, b, 8, 5, '#e6d6b2'); px(77 + o, b + 1, 8, 5, '#e6d6b2'); px(71 + o, b + 5, 8, 1, '#c2ad84'); }
  px(69, 12, 1, H - 12, '#b8a07a'); px(90, 12, 1, H - 12, '#b8a07a');
  // 灌木
  [[0, 6, 14], [146, 6, 14], [0, H - 12, 10], [150, H - 12, 10]].forEach(([a, b, r]) => { for (let i = 0; i < r; i++) for (let j = 0; j < r; j++) if ((i - r / 2) ** 2 + (j - r / 2) ** 2 < (r / 2) ** 2) px(a + i, b + j, 1, 1, (i + j) % 5 ? '#4f8f43' : '#63a655'); });
  // 栅栏
  px(0, 4, GW, 2, '#c9a27a'); px(0, 9, GW, 2, '#c9a27a');
  for (let a = 2; a < GW; a += 8) { if (a > 64 && a < 92) continue; px(a, 1, 3, 13, '#e2c29c'); px(a, 1, 3, 1, '#a57d58'); px(a + 2, 2, 1, 12, '#b88f68'); }
  // 路灯
  [62, 96].forEach(a => { px(a, 16, 2, 16, '#5e4a3c'); px(a - 2, 12, 6, 5, '#5e4a3c'); px(a - 1, 13, 4, 3, '#ffe39a'); px(a - 1, 32, 4, 1, '#5e4a3c'); });
}

function renderGarden() {
  const h = new Date().getHours(), night = h >= 18 || h < 6;
  const greet = h < 5 ? '夜深了' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
  const L = gardenLayout();
  const bubbleIds = ['good', 'tired', 'racing', 'heavy', 'calm', 'unsure'];
  const sprite = it => {
    const { w, h: hh } = spriteSize(it.rows);
    return `<img class="sp ${it.kind}" data-${it.kind}="${it.id}" src="${spriteURL(it.rows)}" alt="" draggable="false"
      style="left:${(it.x - w / 2) / GW * 100}%;top:${(it.b - hh) / L.H * 100}%;width:${w / GW * 100}%;z-index:${Math.round(it.b)}">`;
  };
  const recent = db.entries.slice().sort((a, b) => b.ts - a.ts).slice(0, 3);
  const nPlants = db.entries.length, nDecos = db.care.filter(c => c.deco && !c.deco.hidden).length;

  return `
  <div class="garden-page">
    <section class="scene ${night ? 'night' : ''} ${state.arrange ? 'arranging' : ''}">
      <div class="sky">
        <img class="cloud c1" src="${spriteURL(MISC.cloud)}" alt=""><img class="cloud c2" src="${spriteURL(MISC.cloud)}" alt="">
        ${night ? '<i class="star s1"></i><i class="star s2"></i><i class="star s3"></i><i class="star s4"></i><i class="star s5"></i>' : ''}
        <div class="greet">${greet}。想说说现在的感觉吗？</div>
        <div class="bubbles">${bubbleIds.map((id, i) => `<button class="bubble" data-bubble="${id}" style="--c:${EX[id].color};animation-delay:${-i * .9}s">${EX[id].text}</button>`).join('')}<button class="bubble more" data-act="record">更多…</button></div>
      </div>
      <div class="ground" id="ground" style="aspect-ratio:${GW}/${L.H}">
        <canvas id="ground-cv"></canvas>
        ${night ? '<i class="lamp-glow" style="left:39.4%"></i><i class="lamp-glow" style="left:60.6%"></i>' : ''}
        ${L.items.map(sprite).join('')}
        ${!db.entries.length ? `<div class="ground-hint">记下一种感受，<br>这里就会长出第一株植物</div>` : ''}
        <div class="cat" id="cat"><img alt="小猫小晴" draggable="false"><span class="say" id="say"></span></div>
      </div>
      <div class="scene-tools">
        ${state.arrange ? `<button class="px-mini" data-act="auto-layout">恢复自动摆放</button><button class="px-mini on" data-act="arrange">完成布置</button>`
          : `${L.total > CAP ? `<button class="px-mini" data-act="expand">${state.expanded ? '只看最近' : `看整个小院（${L.total}）`}</button>` : ''}${L.items.length ? '<button class="px-mini" data-act="arrange">布置小院</button>' : ''}`}
      </div>
      ${state.arrange ? '<div class="arrange-tip">拖动植物和小物，把它们摆到喜欢的位置</div>' : ''}
    </section>

    <aside class="garden-side">
      <button class="cta care" data-act="quick">陪我缓一缓</button>
      <p class="cta-sub">不用说清楚发生了什么，先做一件小事</p>
      ${nPlants ? `<p class="garden-count">小院里有 ${nPlants} 株植物${nDecos ? `、${nDecos} 件关怀时留下的小物` : ''}。点一点它们，可以回看当时的自己。</p>` : ''}
      ${recent.length ? `<div class="side-title">最近的记录</div>${recent.map(miniEntry).join('')}<button class="link-btn" data-go="journal">全部手记 ›</button>` : ''}
      ${state.mode === 'mine' ? `<button class="demo-link" data-act="demo">${icon('leaf')} 先逛逛示例小院</button>` : ''}
    </aside>
  </div>`;
}

function miniEntry(e) {
  return `<button class="mini" data-entry="${e.id}"><img class="mini-plant" src="${spriteURL(PLANTS[e.plant].rows)}" alt="">
    <span class="grow"><span class="mini-x">${e.exprs.map(x => EX[x].text).join(' · ')}</span><span class="mini-t">${fmtTime(e.ts)}${e.text ? ' · ' + esc(e.text.slice(0, 14)) + (e.text.length > 14 ? '…' : '') : ''}</span></span></button>`;
}

function mountGarden() {
  const cv = $('#ground-cv'); if (!cv) return;
  drawGround(cv, gardenLayout().H);
  startCat();
  if (state.arrange) enableDrag();
}

// ---- 小猫小晴：散步、打盹、偶尔说一句话；不需要喂养，也不催签到 ----
const CAT_LINES = ['喵～今天也辛苦啦。', '我在这儿晒太阳。', '想说说话的时候，点“陪我缓一缓”就好。', '不记录也没关系，我会一直在。', '慢慢来，比较快。', '我刚巡视了一圈，植物们都很好。'];
function startCat() {
  stopCat();
  const el = $('#cat'); if (!el) return;
  const img = el.querySelector('img'), say = $('#say'), H = gardenLayout().H;
  const c = { x: 80, b: TOP + 6, dir: 1, frame: 0, timers: [] };
  const place = () => { el.style.left = (c.x - 8) / GW * 100 + '%'; el.style.top = (c.b - 12) / H * 100 + '%'; el.style.zIndex = Math.round(c.b) + 1; };
  img.src = spriteURL(MISC.cat1); place();
  const talk = (t, ms = 3200) => { say.textContent = t; say.classList.add('show'); clearTimeout(c.sayT); c.sayT = setTimeout(() => say.classList.remove('show'), ms); };
  const act = () => {
    if (state.arrange) { c.timers.push(setTimeout(act, 3000)); return; }
    const r = Math.random();
    if (r < .62) {
      const nx = 10 + Math.random() * 140, nb = TOP + 4 + Math.random() * (H - TOP - 8);
      const dur = Math.max(1.2, Math.hypot(nx - c.x, nb - c.b) / 14);
      c.dir = nx >= c.x ? 1 : -1; img.style.transform = `scaleX(${c.dir})`;
      el.style.transition = `left ${dur}s linear, top ${dur}s linear`; c.x = nx; c.b = nb; place();
      const anim = setInterval(() => { c.frame ^= 1; img.src = spriteURL(c.frame ? MISC.cat2 : MISC.cat1); }, 220);
      c.timers.push(anim);
      c.timers.push(setTimeout(() => { clearInterval(anim); img.src = spriteURL(MISC.cat1); c.timers.push(setTimeout(act, 2500 + Math.random() * 3000)); }, dur * 1000));
    } else if (r < .85) {
      img.src = spriteURL(MISC.catSleep); el.classList.add('sleep');
      c.timers.push(setTimeout(() => { el.classList.remove('sleep'); img.src = spriteURL(MISC.cat1); act(); }, 7000 + Math.random() * 5000));
    } else { talk(pick(CAT_LINES)); c.timers.push(setTimeout(act, 4000)); }
  };
  el.onclick = e => { e.stopPropagation(); if (!state.arrange) talk(pick(CAT_LINES)); };
  catCtl = c;
  c.timers.push(setTimeout(() => {
    const h = new Date().getHours();
    talk(!db.entries.length ? '喵～我是小晴，以后我就住在你的小院里。' : h >= 23 || h < 5 ? '夜深了，记完就早点休息吧。' : pick(CAT_LINES), 4200);
  }, 900));
  c.timers.push(setTimeout(act, 3500));
}
function stopCat() { if (catCtl) { catCtl.timers.forEach(t => { clearTimeout(t); clearInterval(t); }); clearTimeout(catCtl.sayT); catCtl = null; } }

// ---- 布置小院：只有在布置模式下才能拖动，避免点日记时误拖 ----
function enableDrag() {
  const g = $('#ground'), H = gardenLayout().H;
  g.querySelectorAll('.sp').forEach(el => {
    el.onpointerdown = ev => {
      ev.preventDefault(); el.setPointerCapture(ev.pointerId); el.classList.add('dragging');
      const r = g.getBoundingClientRect(), w = el.offsetWidth / r.width * GW, hh = el.offsetHeight / r.height * H;
      const move = e => {
        const x = Math.max(w / 2, Math.min(GW - w / 2, (e.clientX - r.left) / r.width * GW));
        const b = Math.max(14 + hh / 2, Math.min(H - 1, (e.clientY - r.top) / r.height * H + hh / 2));
        el.style.left = (x - w / 2) / GW * 100 + '%'; el.style.top = (b - hh) / H * 100 + '%'; el.style.zIndex = Math.round(b);
        el._pos = { x: +x.toFixed(1), b: +b.toFixed(1) };
      };
      const up = () => {
        el.classList.remove('dragging'); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up);
        if (!el._pos) return;
        if (el.dataset.plant) db.entries.find(e => e.id === el.dataset.plant).pos = el._pos;
        else db.care.find(c => c.id === el.dataset.deco).deco.pos = el._pos;
        persist();
      };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up);
    };
  });
}

// ======================= 情绪手记 =======================
function renderJournal() {
  return `<div class="page">
    <div class="page-head"><h1>情绪手记</h1><button class="btn btn-soft sm" data-act="record">＋ 记一笔</button></div>
    <div class="subtabs">${[['list', '记录'], ['review', '回顾']].map(([k, n]) => `<button data-sub="${k}" class="${state.sub === k ? 'sel' : ''}">${n}</button>`).join('')}</div>
    ${state.sub === 'list' ? renderList() : renderReview()}
  </div>`;
}

function renderList() {
  let list = db.entries.slice().sort((a, b) => b.ts - a.ts);
  let html = '';
  if (state.filter) {
    list = list.filter(e => state.filter.ids.includes(e.id));
    html += `<div class="filter-bar"><span>正在看：${esc(state.filter.label)}（${list.length} 条）</span><button data-act="clear-filter">看全部</button></div>`;
  }
  if (!list.length) return html + `<div class="empty">${icon('sprout', 'empty-sp')}<p>还没有记录。<br>回到小院，点“陪我缓一缓”记下第一笔吧。</p></div>`;
  const groups = {};
  list.forEach(e => (groups[ymd(e.ts)] = groups[ymd(e.ts)] || []).push(e));
  for (const [day, arr] of Object.entries(groups)) {
    const d = new Date(day + 'T00:00');
    const label = day === ymd(Date.now()) ? '今天' : day === ymd(Date.now() - 864e5) ? '昨天' : `${d.getMonth() + 1}月${d.getDate()}日`;
    html += `<div class="day-head">${label} · 周${WEEK[d.getDay()]}</div>` + arr.map(entryCard).join('');
  }
  return html;
}
function entryCard(e) {
  const d = new Date(e.ts);
  return `<button class="entry" data-entry="${e.id}">
    <img class="entry-plant" src="${spriteURL(PLANTS[e.plant].rows)}" alt="${PLANTS[e.plant].name}">
    <span class="grow">
      <span class="entry-top">${e.exprs.map(exprChip).join('')}<span class="entry-time">${pad(d.getHours())}:${pad(d.getMinutes())}</span></span>
      ${e.text ? `<span class="entry-txt">${esc(e.text)}</span>` : ''}
      ${e.ctx.length ? `<span class="entry-ctx">${e.ctx.map(c => `# ${c}`).join('　')}</span>` : ''}
    </span></button>`;
}

// ---- 回顾：先读温柔的小结，再看图表 ----
let REPORT_CACHE = [];
function renderReview() {
  const n = state.range, list = entriesIn(n);
  let html = `<div class="seg-row"><div class="seg">${[[7, '最近 7 天'], [30, '最近 30 天']].map(([k, t]) => `<button data-range="${k}" class="${k === n ? 'sel' : ''}">${t}</button>`).join('')}</div></div>`;
  if (!list.length) return html + `<div class="empty">${icon('sprout', 'empty-sp')}<p>这段时间还没有记录。<br>记下几次感受后，这里会出现小晴写给你的回顾。</p></div>`;
  const rep = buildReport(list, n);
  REPORT_CACHE = rep;
  html += `<div class="card letter">
    <div class="letter-head">${icon('heart')}<b>小晴的${n === 7 ? '周' : '月'}回顾</b></div>
    <div class="src-tag">本地规则生成 · 基于 ${list.length} 条记录</div>
    ${rep.map(sec => `<div class="rsec"><h4>${sec.title}</h4>${sec.items.length ? sec.items.map(o => `<div class="obs"><p>${o.text}</p>
      <span class="obs-act">${o.ids && o.ids.length ? `<button data-view="${o.key}">查看这 ${o.ids.length} 条记录</button>` : ''}${o.dismissable ? `<button class="quiet" data-dismiss="${o.key}">不太符合</button>` : ''}</span></div>`).join('') : `<p class="obs-empty">${sec.empty}</p>`}</div>`).join('')}
    <div id="ai-letter"></div>
    ${aiCfg().provider !== 'none' ? `<button class="btn btn-ghost sm" data-act="ai-letter">请大模型帮小晴写一封信</button>` : ''}
  </div>`;
  html += `<h3 class="chart-title">这段时间出现过的感受</h3><div class="card">${exprBars(list)}</div>`;
  html += `<h3 class="chart-title">每天留下的记录</h3><div class="card">${dayStrip(list, n)}</div>`;
  html += `<h3 class="chart-title">这些情境中，你记录过怎样的感受</h3><div class="card">${ctxTable(list)}</div>`;
  html += `<h3 class="chart-title">你通常在什么时候记录</h3><div class="card">${timeGrid(list)}</div>`;
  return html;
}

function buildReport(list, n) {
  const range = n === 7 ? '这 7 天' : '这 30 天';
  const dis = k => db.dismiss.includes(`${n}:${k}`);
  // 一、记录了什么
  const s1 = [];
  const days = new Set(list.map(e => ymd(e.ts))).size;
  const cnt = {}; list.forEach(e => e.exprs.forEach(x => cnt[x] = (cnt[x] || 0) + 1));
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
  let t = `${range}里，你留下了 <b>${list.length}</b> 条记录，分布在 ${days} 天。`;
  if (top.length) t += `出现最多的是「${EX[top[0][0]].text}」（${top[0][1]} 次）${top[1] ? `和「${EX[top[1][0]].text}」（${top[1][1]} 次）` : ''}。`;
  s1.push({ key: 'all', text: t, ids: list.map(e => e.id), label: `${range}的全部记录` });
  const mixed = list.filter(e => e.exprs.length > 1);
  if (mixed.length) s1.push({ key: 'mixed', text: `有 ${mixed.length} 条同时记下了不止一种感受，它们本来就可以同时存在。`, ids: mixed.map(e => e.id), label: '同时有几种感受的记录' });
  const uns = list.filter(e => e.exprs.includes('unsure'));
  if (uns.length) s1.push({ key: 'unsure', text: `有 ${uns.length} 次你选了「说不清」，那也是一次认真的停顿。`, ids: uns.map(e => e.id), label: '「说不清」的记录' });

  // 二、可能重复出现的情境（措辞随样本量调整，不把少量记录说成规律）
  const s2 = [];
  const byCtx = {}; list.forEach(e => e.ctx.forEach(c => (byCtx[c] = byCtx[c] || []).push(e)));
  Object.entries(byCtx).filter(([, a]) => a.length >= 2).sort((a, b) => b[1].length - a[1].length).slice(0, 3).forEach(([c, a]) => {
    const unc = a.filter(e => tone(e) === 'unc').length, comfy = a.filter(e => tone(e) === 'comfy').length;
    const ec = {}; a.forEach(e => e.exprs.forEach(x => ec[x] = (ec[x] || 0) + 1));
    const tops = Object.entries(ec).sort((x, y) => y[1] - x[1]).slice(0, 2).map(([x]) => `「${EX[x].text}」`).join('');
    let text;
    if (a.length < 3) {
      const tn = unc === a.length ? '都伴随不太舒服的感受' : comfy === a.length ? '都伴随比较舒服的感受' : '感受各不相同';
      text = `有 ${a.length} 条记录提到「${c}」，${tn}。记录还少，可以继续观察。`;
    } else if (unc / a.length >= .7) text = `「${c}」出现在 ${a.length} 条记录里，其中 ${unc} 条伴随${tops}这类感受。它可能是一个值得留意的情境。`;
    else if (comfy / a.length >= .7) text = `「${c}」出现在 ${a.length} 条记录里，其中 ${comfy} 条感受比较舒服。它也许是帮你充电的情境。`;
    else text = `「${c}」出现在 ${a.length} 条记录里，有时不太舒服，有时也挺好。同一个情境，也会带来不同的感受。`;
    s2.push({ key: 'ctx:' + c, text, ids: a.map(e => e.id), label: `提到「${c}」的记录`, dismissable: true });
  });
  const late = list.filter(e => { const h = new Date(e.ts).getHours(); return h >= 22 || h < 5; });
  if (late.length >= 3) {
    const u = late.filter(e => tone(e) === 'unc').length;
    s2.push({ key: 'late', text: `有 ${late.length} 条记录写在晚上 10 点以后${u / late.length >= .6 ? `，其中 ${u} 条感受比较沉重。夜里情绪容易被放大，可以留意一下` : ''}。`, ids: late.map(e => e.id), label: '晚上 10 点后的记录', dismissable: true });
  }

  // 三、被自己标记为有帮助的行动
  const s3 = [];
  const since = Date.now() - n * 864e5, care = db.care.filter(c => c.ts >= since && c.fb);
  if (care.length) {
    const good = {}; care.filter(c => c.fb === 'better').forEach(c => good[c.title] = (good[c.title] || 0) + 1);
    const g = Object.entries(good).sort((a, b) => b[1] - a[1]);
    let tx = `你做过 ${care.length} 次关怀。`;
    tx += g.length ? `被你标记为“好一点”的有：${g.map(([k, v]) => `「${k}」${v > 1 ? ` ×${v}` : ''}`).join('、')}。` : '还没有被标记为“好一点”的，可以换几种试试。';
    const w = care.filter(c => c.fb === 'worse').length;
    if (w) tx += `也有 ${w} 次你觉得更难受了，谢谢你如实记下。不是每种方法都适合每个时刻。`;
    s3.push({ key: 'care', text: tx });
  }
  return [
    { title: '这段时间记录了什么', items: s1.filter(o => !dis(o.key)) },
    { title: '可能重复出现的情境', items: s2.filter(o => !dis(o.key)), empty: '情境标签还不多，暂时看不出重复出现的情境。记录时顺手点一个“可能有关”的标签，下次就能看到。' },
    { title: '你觉得有帮助的行动', items: s3, empty: '这段时间还没有关怀记录。需要的时候，“陪我缓一缓”随时都在。' },
  ];
}

function exprBars(list) {
  const cnt = {}; list.forEach(e => e.exprs.forEach(x => cnt[x] = (cnt[x] || 0) + 1));
  const max = Math.max(...Object.values(cnt));
  return Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([x, v]) =>
    `<div class="bar-row"><span>${EX[x].text}</span><span class="track"><i style="width:${v / max * 100}%;background:${EX[x].color}"></i></span><span class="v">${v} 次</span></div>`).join('');
}
function dayStrip(list, n) {
  const days = []; for (let i = n - 1; i >= 0; i--) days.push(ymd(Date.now() - i * 864e5));
  const by = {}; list.forEach(e => (by[ymd(e.ts)] = by[ymd(e.ts)] || []).push(e));
  return `<div class="strip ${n === 30 ? 'dense' : ''}">${days.map((d, i) => {
    const arr = (by[d] || []).sort((a, b) => a.ts - b.ts), dd = new Date(d + 'T00:00');
    const lab = n === 7 ? '周' + WEEK[dd.getDay()] : (i % 5 === 0 || i === n - 1) ? `${dd.getMonth() + 1}/${dd.getDate()}` : '';
    const dots = arr.length ? arr.flatMap(e => e.exprs.map(x => `<i style="background:${EX[x].color};opacity:${.45 + e.intensity * .11}" title="${EX[x].text}"></i>`)).slice(0, 6).join('') : '<i class="none"></i>';
    return `<div class="col"><div class="dots">${dots}</div><span>${lab}</span></div>`;
  }).join('')}</div>
  <p class="chart-note">每个小方块是一种记下的感受，颜色越深表示越强烈。空白只表示那天没有记录，不代表平静，也不代表没有情绪。</p>`;
}
function ctxTable(list) {
  const by = {}; list.forEach(e => e.ctx.forEach(c => (by[c] = by[c] || []).push(e)));
  const rows = Object.entries(by).sort((a, b) => b[1].length - a[1].length);
  if (!rows.length) return '<p class="chart-note">还没有带情境标签的记录。</p>';
  return rows.map(([c, a]) => {
    const ec = {}; a.forEach(e => e.exprs.forEach(x => ec[x] = (ec[x] || 0) + 1));
    return `<div class="ctx-row"><div class="ctx-name"><b>${c}</b><span>${a.length} 条</span></div><div class="ctx-chips">${Object.entries(ec).sort((x, y) => y[1] - x[1]).map(([x, v]) => `<span class="xchip" style="--c:${EX[x].color}">${EX[x].text}${v > 1 ? ' ×' + v : ''}</span>`).join('')}</div></div>`;
  }).join('') + '<p class="chart-note">同一个情境里，可能既有难受也有满足。这里只列出你记下的感受，不给情境贴好坏标签。</p>';
}
function timeGrid(list) {
  const SL = [['早上', h => h >= 5 && h < 11], ['白天', h => h >= 11 && h < 18], ['晚上', h => h >= 18 && h < 22], ['深夜', h => h >= 22 || h < 5]];
  const ORD = [1, 2, 3, 4, 5, 6, 0];
  const m = SL.map(([, f]) => ORD.map(wd => list.filter(e => { const d = new Date(e.ts); return d.getDay() === wd && f(d.getHours()); }).length));
  const max = Math.max(1, ...m.flat());
  return `<div class="tgrid"><span></span>${ORD.map(d => `<span class="h">${WEEK[d]}</span>`).join('')}
    ${SL.map(([nm], i) => `<span class="h">${nm}</span>${m[i].map(v => `<span class="c" style="background:${v ? `rgba(127,168,140,${.2 + v / max * .7})` : '#F2ECE3'}">${v || ''}</span>`).join('')}`).join('')}</div>
    <p class="chart-note">数字是记录次数，只反映你通常什么时候愿意停下来记一笔。</p>`;
}

// ======================= 关怀工具箱 =======================
function effScore() {
  const m = {};
  db.care.forEach(c => { if (!c.fb || !c.action) return; (m[c.action] = m[c.action] || []).push({ better: 2, same: 1, worse: 0 }[c.fb]); });
  return Object.fromEntries(Object.entries(m).map(([k, a]) => [k, a.reduce((x, y) => x + y, 0) / a.length]));
}
function rankActions(ids) {
  const eff = effScore();
  return ids.map((id, i) => ({ id, s: (eff[id] ?? 1) * .6 - i * .25 })).sort((a, b) => b.s - a.s).map(x => x.id);
}
// ---- 建议卡片：先给一个能直接开始的建议；时间和意愿只是可选的调整，不是必答题 ----
function recentEntry() {
  const e = db.entries.slice().sort((a, b) => b.ts - a.ts)[0];
  return e && Date.now() - e.ts < 3 * 3600e3 ? e : null;
}
function newQuick(entry) { return { entry: entry ?? recentEntry(), time: 0, want: 'any', idx: 0, adjust: false }; }
function quickCandidates(q) {
  const base = q.entry ? FAM_ACTIONS[mainFam(q.entry)] : DEFAULT_ACTIONS;
  if (!q.time && q.want === 'any') return rankActions(base);
  const fits = a => (!q.time || (q.time === 1 ? a.mins <= 2 : q.time === 3 ? a.mins >= 2 && a.mins <= 5 : a.mins >= 4)) && (q.want === 'any' || a.want === q.want);
  let ids = ACTIONS.filter(fits).map(a => a.id);
  if (!ids.length) ids = ACTIONS.filter(a => q.want === 'any' || a.want === q.want).map(a => a.id);
  ids.sort((a, b) => (base.includes(b) ? 1 : 0) - (base.includes(a) ? 1 : 0));
  return rankActions(ids);
}
function quickHTML(q) {
  const c = quickCandidates(q), a = ACT[c[q.idx % c.length]];
  const sub = q.entry ? `参考你刚才记下的「${q.entry.exprs.map(x => EX[x].text).join('、')}」` : '暂时不用说什么。';
  const chip = (k, v, t) => `<button data-qset="${k}:${v}" class="${q[k] === v ? 'sel' : ''}">${t}</button>`;
  return `<div class="quick">
    <div class="q-ask">${a.ask}</div>
    <div class="q-sub">${sub}</div>
    <div class="q-note">${a.note}</div>
    <div class="q-btns"><button class="btn btn-primary" data-q="start" data-id="${a.id}">开始</button><button class="btn btn-ghost" data-q="next">换一个</button></div>
    <div class="q-cond"><span>${a.mins} 分钟 · ${WANT[a.want]}</span><button data-q="adjust">${q.adjust ? '收起' : '调整'}</button></div>
    ${q.adjust ? `<div class="q-adjust"><div class="q-lbl">有多少时间</div><div class="chips">${chip('time', 0, '都行')}${chip('time', 1, '1 分钟')}${chip('time', 3, '3 分钟左右')}${chip('time', 10, '10 分钟以上')}</div>
      <div class="q-lbl">想做什么</div><div class="chips">${chip('want', 'any', '都行')}${chip('want', 'quiet', '想静静')}${chip('want', 'move', '想动一动')}${chip('want', 'write', '想写点什么')}</div></div>` : ''}
  </div>`;
}
function mountQuick(box, q, onStart) {
  const draw = () => { box.innerHTML = quickHTML(q); };
  box.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    e.stopPropagation();
    if (b.dataset.q === 'start') return onStart(b.dataset.id);
    if (b.dataset.q === 'next') { q.idx++; return draw(); }
    if (b.dataset.q === 'adjust') { q.adjust = !q.adjust; return draw(); }
    if (b.dataset.qset) { const [k, v] = b.dataset.qset.split(':'); q[k] = k === 'time' ? +v : v; q.idx = 0; return draw(); }
  };
  draw();
}
// 首页「陪我缓一缓」：不需要先记录，直接给一个可以开始的小行动
function openQuick() {
  const s = $('#quick');
  s.innerHTML = `<div class="grab"></div><div class="sheet-head"><h2>陪你缓一缓</h2><button class="close" data-x aria-label="关闭">✕</button></div>
    <div id="quick-box"></div>
    <button class="link-btn" data-own>去工具箱自己挑 ›</button>`;
  s.querySelector('[data-x]').onclick = () => closeSheet('#quick-mask');
  s.querySelector('[data-own]').onclick = () => { closeSheet('#quick-mask'); go('care'); setTimeout(() => $('#own')?.scrollIntoView({ behavior: 'smooth' }), 80); };
  mountQuick($('#quick-box'), newQuick(), id => { closeSheet('#quick-mask'); startAction(id, 'quick'); });
  openSheet('#quick-mask');
}

function renderCare() {
  const helped = Object.entries(effScore()).filter(([k, v]) => v >= 1.5 && ACT[k]).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return `<div class="page">
    <div class="page-head"><h1>关怀工具箱</h1></div>
    <div class="card" id="care-quick"></div>
    ${helped.length ? `<div class="helped"><span>你标记过有帮助的：</span>${helped.map(([k]) => `<button data-start="${k}">${ACT[k].title}</button>`).join('')}</div>` : ''}
    <h3 class="chart-title" id="own">自己挑</h3>
    <div class="cat-card">${icon('rain', 'cat-ic')}<div class="grow"><b>自然声音</b><p>雨声、鸟鸣、海浪、微风、篝火，可以定时结束</p></div><button class="btn btn-soft sm" data-open="sound">打开</button></div>
    <div class="cat-card">${icon('shoe', 'cat-ic')}<div class="grow"><b>轻活动</b><p>跟着提示动一动，可以暂停，也可以提前结束</p>
      <div class="sub-acts"><button data-start="walk5">散步 5 分钟</button><button data-start="stretch3">座位舒展</button><button data-start="shake2">抖一抖</button></div></div></div>
    <div class="cat-card">${icon('pencil', 'cat-ic')}<div class="grow"><b>引导书写</b><p>一个开放的问题，自由写，可以保存也可以放弃</p></div><button class="btn btn-soft sm" data-open="write">打开</button></div>
    <details class="more"><summary>更多练习：呼吸与冥想</summary>
      <div class="sub-acts">${['breath1', 'box1', 'ground3', 'body4', 'kind2'].map(id => `<button data-start="${id}">${ACT[id].title}</button>`).join('')}</div></details>
    <p class="note">这些小行动适合日常调节，不能代替专业帮助。如果难受持续两周以上，或影响到睡眠和生活，请联系专业人士。全国心理援助热线 <b>12356</b></p>
  </div>`;
}

// ======================= 路由 =======================
function render() {
  stopCat();
  const v = $('#view');
  v.className = 'view view-' + state.tab;
  v.innerHTML = { garden: renderGarden, journal: renderJournal, care: renderCare }[state.tab]();
  document.querySelectorAll('.tabbar [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === state.tab));
  $('#demo-banner').hidden = state.mode !== 'demo';
  if (state.tab === 'garden') mountGarden();
  if (state.tab === 'care') mountQuick($('#care-quick'), state.careQuick ||= newQuick(), id => startAction(id, 'tab'));
}
function go(tab) { state.tab = tab; state.arrange = false; state.careQuick = null; render(); window.scrollTo(0, 0); }

document.querySelectorAll('.tabbar [data-tab]').forEach(b => {
  b.querySelector('img').src = spriteURL(MISC[b.dataset.icon]);
  b.addEventListener('click', () => { if (b.dataset.tab === 'journal') state.filter = null; go(b.dataset.tab); });
});
$('#btn-settings').addEventListener('click', openSettings);
$('#btn-sound').addEventListener('click', () => { soundOn = !soundOn; save(K.sound, soundOn); if (soundOn) ac(); syncSound(); toast(soundOn ? '打开了小院的声音' : '小院安静下来了'); });
$('#demo-exit').addEventListener('click', exitDemo);

$('#view').addEventListener('click', ev => {
  const t = ev.target.closest('button, [data-plant], [data-deco]');
  if (!t) return;
  const d = t.dataset;
  if (d.plant) return state.arrange ? null : openEntry(d.plant);
  if (d.deco) return state.arrange ? null : openDeco(d.deco);
  if (d.bubble) return openRecord([d.bubble]);
  if (d.entry) return openEntry(d.entry);
  if (d.go) return go(d.go);
  if (d.sub) { state.sub = d.sub; state.filter = null; return render(); }
  if (d.range) { state.range = +d.range; return render(); }
  if (d.view) { const o = REPORT_CACHE.flatMap(s => s.items).find(x => x.key === d.view); state.filter = { ids: o.ids, label: o.label }; state.sub = 'list'; return go('journal'); }
  if (d.dismiss) { db.dismiss.push(`${state.range}:${d.dismiss}`); persist(); toast('谢谢告诉我，这条先不显示了'); return render(); }
  if (d.start) return startAction(d.start, 'tab');
  if (d.open === 'sound') { player.origin = 'tab'; return openSoundPlayer({}); }
  if (d.open === 'write') { player.origin = 'tab'; return openWriter({}); }
  switch (d.act) {
    case 'record': return openRecord([]);
    case 'quick': return openQuick();
    case 'demo': return enterDemo();
    case 'arrange': state.arrange = !state.arrange; if (!state.arrange) toast('小院布置好啦'); return render();
    case 'auto-layout': db.entries.forEach(e => delete e.pos); db.care.forEach(c => c.deco && delete c.deco.pos); persist(); return render();
    case 'expand': state.expanded = !state.expanded; return render();
    case 'clear-filter': state.filter = null; return render();
    case 'ai-letter': return aiLetter(t);
  }
});

async function aiLetter(btn) {
  const list = entriesIn(state.range), box = $('#ai-letter');
  btn.disabled = true; btn.textContent = '小晴正在写…';
  const cnt = {}; list.forEach(e => e.exprs.forEach(x => cnt[x] = (cnt[x] || 0) + 1));
  const summary = `范围：最近 ${state.range} 天，${list.length} 条记录\n感受次数：${Object.entries(cnt).map(([x, v]) => EX[x].text + ' ' + v).join('，')}\n` +
    `本地观察：${REPORT_CACHE.flatMap(s => s.items).map(o => o.text.replace(/<[^>]+>/g, '')).join(' / ')}\n部分原文：${list.filter(e => e.text).slice(-8).map(e => e.text).join(' | ')}`;
  try {
    const text = await callLLM('你是「心晴」小院里的猫“小晴”。根据用户的记录写一封 200 字左右的中文短信：回顾与共情、引用具体记录说说可能的规律（样本少时要说明“还需要继续观察”）、给 1~2 个温和的小建议。不诊断、不打分，结尾署名“小晴”。', summary);
    box.innerHTML = `<div class="ai-letter-body">${esc(text)}</div><div class="src-tag">${srcLabel('ai:' + aiCfg().provider)} · 发送了本段统计与最多 8 条原文</div>`;
  } catch (e) { box.innerHTML = `<p class="chart-note">大模型调用失败（${esc(e.message)}），上面的本地回顾不受影响。</p>`; }
  btn.remove();
}

// ======================= 记录：选择贴近自己的表达 =======================
let draft = null;
function ctxOrder() {
  const f = {}; db.entries.forEach(e => e.ctx.forEach(c => f[c] = (f[c] || 0) + 1));
  const all = [...CTX_BASE, ...CTX_MORE];
  const used = all.filter(c => f[c]).sort((a, b) => f[b] - f[a]);
  const first = [...new Set([...used.slice(0, 4), ...CTX_BASE])].slice(0, 6);
  return { first, more: all.filter(c => !first.includes(c)) };
}
function openRecord(exprs) {
  draft = { exprs: [...exprs], intensity: 3, ctx: [], text: '', moreCtx: false };
  $('#record-sheet').onclick = null;
  renderRecord(); openSheet('#record-mask');
  $('#record-sheet').scrollTop = 0;
}
function renderRecord() {
  const d = draft, { first, more } = ctxOrder();
  const tag = c => `<button data-ctx="${c}" class="${d.ctx.includes(c) ? 'sel' : ''}">${c}</button>`;
  const onlyUnsure = d.exprs.length === 1 && d.exprs[0] === 'unsure';
  $('#record-sheet').innerHTML = `<div class="grab"></div>
    <div class="sheet-head"><h2>现在的你，更像是…</h2><button class="close" data-x aria-label="关闭">✕</button></div>
    <p class="sheet-sub">可以选不止一个。说不清，也可以。</p>
    <div class="xgrid">${EXPR.map(e => `<button data-x-expr="${e.id}" style="--c:${e.color}" class="${d.exprs.includes(e.id) ? 'sel' : ''}">${e.text}</button>`).join('')}</div>
    ${d.exprs.length && !onlyUnsure ? `<div class="field-t">有多明显？<span>可以不选</span></div>
      <div class="lvl">${[1, 2, 3, 4, 5].map(i => `<button data-lvl="${i}" class="${d.intensity === i ? 'sel' : ''}">${INTENSITY[i]}</button>`).join('')}</div>` : ''}
    <div class="field-t">可能和什么有关？<span>不知道也没关系</span></div>
    <div class="ctx">${first.map(tag).join('')}${d.moreCtx ? more.map(tag).join('') : `<button class="more-btn" data-more>更多…</button>`}</div>
    <div class="field-t">想多说几句吗？<span>可以不写</span></div>
    <textarea class="journal" id="journal" rows="3" placeholder="这里只有你自己能看到">${esc(d.text)}</textarea>
    <div class="prompts">${JOURNAL_PROMPTS.map(p => `<button data-prompt="${p}">${p}</button>`).join('')}</div>
    <div class="sheet-foot"><button class="cta cta-sm" data-plant-now ${d.exprs.length ? '' : 'disabled'}>${d.exprs.length ? '种下此刻' : '先选一个最接近的感觉'}</button></div>`;
}
$('#record-sheet').addEventListener('input', e => { if (e.target.id === 'journal' && draft) draft.text = e.target.value; });
$('#record-sheet').addEventListener('click', e => {
  if (!draft || draft.done) return;
  const t = e.target.closest('button'); if (!t) return;
  const d = t.dataset;
  if ('x' in d) return closeSheet('#record-mask');
  if (d.xExpr) {
    const i = draft.exprs.indexOf(d.xExpr);
    if (i >= 0) draft.exprs.splice(i, 1);
    else if (draft.exprs.length >= 3) return toast('最多选三种就好');
    else draft.exprs.push(d.xExpr);
    return keepScroll(renderRecord);
  }
  if (d.lvl) { draft.intensity = +d.lvl; return keepScroll(renderRecord); }
  if (d.ctx) { const i = draft.ctx.indexOf(d.ctx); i >= 0 ? draft.ctx.splice(i, 1) : draft.ctx.push(d.ctx); t.classList.toggle('sel'); return; }
  if ('more' in d) { draft.moreCtx = true; return keepScroll(renderRecord); }
  if (d.prompt) { const j = $('#journal'); j.value += (j.value && !j.value.endsWith('\n') ? '\n' : '') + d.prompt; draft.text = j.value; j.focus(); return; }
  if ('plantNow' in d) return plantEntry();
});
function keepScroll(fn) { const s = $('#record-sheet'), y = s.scrollTop; fn(); s.scrollTop = y; }

async function plantEntry() {
  const d = draft; d.done = true;
  const e = { id: uid(), ts: Date.now(), exprs: d.exprs.slice(), intensity: d.exprs.length === 1 && d.exprs[0] === 'unsure' ? 3 : d.intensity, ctx: d.ctx.slice(), text: d.text.trim(), plant: randPlant() };
  db.entries.push(e); persist();
  const crisis = CRISIS_RE.test(e.text), dist = DISTORTIONS.filter(x => x.re.test(e.text));
  const s = $('#record-sheet');
  s.scrollTop = 0;
  s.innerHTML = `<div class="grab"></div><div class="sheet-head"><h2>种下了此刻</h2><button class="close" data-x2 aria-label="关闭">✕</button></div>
    <div class="plant-stage"><img id="grow" src="${spriteURL(MISC.seed)}" alt=""><button class="skip" data-skip>跳过</button></div>
    <div class="plant-name" id="pname">&nbsp;</div>
    <div id="after" hidden>
      <div class="swap-row"><button class="link-btn" data-swap>换一株</button></div>
      ${crisis ? crisisCard() : ''}
      <div class="reply"><div class="reply-head"><img src="${spriteURL(MISC.cat1)}" alt="">小晴<span class="src-tag" id="rsrc"></span></div><div class="reply-text typing" id="rtext"></div>
        ${dist.length ? `<details class="reframe"><summary>换个角度想想（${dist.length}）</summary>${dist.map(x => `<p><b>${x.name}</b>：${x.tip}</p>`).join('')}</details>` : ''}</div>
      <button class="cta cta-sm" data-x2>完成</button>
      ${tone(e) !== 'comfy' ? `<div class="more-care"><button class="link-btn" data-morecare>需要的话，陪你缓一缓 ›</button></div><div id="after-care"></div>` : ''}
    </div>`;
  const grow = $('#grow'), timers = [];
  let shown = false;
  const finish = () => {
    if (shown) return; shown = true;
    timers.forEach(clearTimeout); grow.src = spriteURL(PLANTS[e.plant].rows); grow.classList.remove('bump'); grow.classList.add('pop');
    $('#pname').innerHTML = `一株${PLANTS[e.plant].name}<span class="saved">已经种进你的小院</span>`; s.querySelector('[data-skip]')?.remove(); $('#after').hidden = false; chime();
  };
  [[MISC.sprout, 450], [PLANTS[e.plant].rows, 950]].forEach(([rows, ms], i) => timers.push(setTimeout(() => {
    if (i === 1) return finish();
    grow.src = spriteURL(rows); grow.classList.remove('bump'); void grow.offsetWidth; grow.classList.add('bump');
  }, ms)));
  s.onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return;
    const bd = b.dataset;
    if ('skip' in bd) return finish();
    if ('swap' in bd) {
      let p; do p = randPlant(); while (p === e.plant); e.plant = p; persist();
      grow.src = spriteURL(PLANTS[p].rows); grow.classList.remove('pop'); void grow.offsetWidth; grow.classList.add('pop');
      $('#pname').innerHTML = `一株${PLANTS[p].name}<span class="saved">已经种进你的小院</span>`; return;
    }
    const leave = () => { s.onclick = null; closeSheet('#record-mask'); go('garden'); };
    if ('x2' in bd) return leave();
    // 记录到这里就算完成；关怀是可选的后续，并且直接参考这次记录，不再重复问心情
    if ('morecare' in bd) {
      b.parentElement.remove();
      mountQuick($('#after-care'), newQuick(e), id => { leave(); startAction(id, 'record'); });
      const done = s.querySelector('.cta[data-x2]');
      done.className = 'btn btn-ghost btn-block'; done.textContent = '先不用，回小院'; $('#after-care').after(done);
      setTimeout(() => $('#after-care').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  };
  const reply = crisis
    ? { text: '谢谢你愿意把这么沉重的感受说出来。你现在的痛苦是真实的，你值得被帮助，也不必一个人扛着。请现在就联系上面的热线，或者告诉一个你信任的人。', src: 'local' }
    : await genReply(e);
  e.reply = { text: reply.text, src: reply.src }; persist();
  while (!shown) await new Promise(r => setTimeout(r, 100));
  if (!$('#rtext')) return;
  $('#rsrc').textContent = srcLabel(reply.src) + (reply.err ? `（大模型调用失败：${reply.err}）` : '');
  typeOut($('#rtext'), reply.text);
}
function crisisCard() {
  return `<div class="crisis"><b>你并不孤单</b><br>如果你正经历非常痛苦的时刻，请马上联系专业的人：<br>
    全国心理援助热线 <a href="tel:12356">12356</a> · 希望24热线 <a href="tel:4001619995">400-161-9995</a><br>紧急情况请拨打 <a href="tel:110">110</a> / <a href="tel:120">120</a></div>`;
}
async function typeOut(el, text) {
  el.classList.add('typing'); el.textContent = '';
  const step = Math.max(1, Math.round(text.length / 90));
  for (let i = 0; i < text.length; i += step) { el.textContent = text.slice(0, i + step); await new Promise(r => setTimeout(r, 18)); }
  el.classList.remove('typing');
}

// ---- 回看：点植物看日记，点小物看关怀 ----
function openEntry(id) {
  const e = db.entries.find(x => x.id === id); if (!e) return;
  const s = $('#detail');
  s.innerHTML = `<div class="grab"></div><div class="sheet-head"><h2>${fmtTime(e.ts)}</h2><button class="close" data-x aria-label="关闭">✕</button></div>
    <div class="detail-hero"><img src="${spriteURL(PLANTS[e.plant].rows)}" alt=""><span>那时种下的${PLANTS[e.plant].name}</span></div>
    <div class="chips-line">${e.exprs.map(exprChip).join('')}${e.exprs[0] !== 'unsure' ? `<span class="muted small">程度：${INTENSITY[e.intensity]}</span>` : ''}</div>
    ${e.ctx.length ? `<p class="muted small">可能有关：${e.ctx.join('、')}</p>` : ''}
    ${e.text ? `<div class="detail-text">${esc(e.text)}</div>` : '<p class="muted small">这次没有写文字。</p>'}
    ${e.reply ? `<div class="reply"><div class="reply-head"><img src="${spriteURL(MISC.cat1)}" alt="">小晴<span class="src-tag">${srcLabel(e.reply.src)}</span></div><div class="reply-text">${esc(e.reply.text)}</div></div>` : ''}
    <button class="link-btn danger" data-del>删除这条记录</button>`;
  s.onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if ('x' in b.dataset) closeSheet('#detail-mask');
    if ('del' in b.dataset && confirm('删除后，这株植物也会从小院里消失。确定吗？')) { db.entries = db.entries.filter(x => x.id !== id); persist(); closeSheet('#detail-mask'); render(); toast('已删除'); }
  };
  openSheet('#detail-mask'); s.scrollTop = 0;
}
function openDeco(id) {
  const c = db.care.find(x => x.id === id); if (!c) return;
  const s = $('#detail');
  s.innerHTML = `<div class="grab"></div><div class="sheet-head"><h2>${DECOS[c.deco.type].name}</h2><button class="close" data-x aria-label="关闭">✕</button></div>
    <div class="detail-hero"><img src="${spriteURL(DECOS[c.deco.type].rows)}" alt=""><span>来自${fmtTime(c.ts)}的「${esc(c.title)}」</span></div>
    <p>做完之后你觉得：<b>${c.fb ? FB[c.fb] : '没有标记'}</b></p>
    ${c.prompt ? `<p class="muted small">那次的问题：${esc(c.prompt)}</p>` : ''}
    ${c.text ? `<div class="detail-text">${esc(c.text)}</div>` : ''}
    <button class="link-btn" data-hide>把它从小院收起来</button>`;
  s.onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if ('x' in b.dataset) closeSheet('#detail-mask');
    if ('hide' in b.dataset) { c.deco.hidden = true; persist(); closeSheet('#detail-mask'); render(); toast('收起来了'); }
  };
  openSheet('#detail-mask'); s.scrollTop = 0;
}

// ======================= 行动播放器 =======================
function stopPlayer() {
  clearInterval(player.timer); player.timer = null;
  if (player.sound) { player.sound.stop(); player.sound = null; }
  syncSound();
}
function closePlayer() { stopPlayer(); closeSheet('#player-mask'); }
function pHead(title) { return `<div class="grab"></div><div class="sheet-head"><h2>${title}</h2><button class="close" data-px aria-label="关闭">✕</button></div>`; }
function bindClose() { $('#player').querySelector('[data-px]').onclick = closePlayer; }

function startAction(id, origin) {
  const a = ACT[id];
  player.origin = origin;
  if (a.kind === 'sound') return openSoundPlayer({ action: a });
  if (a.kind === 'write') return openWriter({ action: a });
  return openPractice(a);
}

function openPractice(a) {
  const p = PRACTICE[a.ref], el = $('#player');
  stopPlayer();
  const seq = [];
  if (p.type === 'breath') for (let c = 0; c < a.cycles; c++) p.phases.forEach(ph => seq.push({ ...ph, c }));
  else p.steps.forEach(([t, s]) => seq.push({ t, s }));
  const total = seq.reduce((x, y) => x + y.s, 0);
  el.innerHTML = pHead(a.title) + `<div class="stage">
    <div class="orb-wrap"><div class="orb ${p.type === 'steps' ? 'soft' : ''}" id="orb"></div></div>
    <div class="phase" id="phase">${a.note}</div><div class="guide" id="guide">${p.type === 'breath' ? p.phases.map(x => `${x.t} ${x.s} 秒`).join(' → ') : '准备好了就开始，随时可以暂停。'}</div>
    <div class="count" id="count"></div></div>
    <div class="pbar"><i id="pbar"></i></div>
    <div class="pbtns"><button class="btn btn-primary" id="p-go">开始</button><button class="btn btn-ghost" id="p-end" hidden>提前结束</button></div>`;
  bindClose();
  let i = -1, left = 0, elapsed = 0, running = false, started = false;
  const orb = $('#orb'), goBtn = $('#p-go');
  const show = () => {
    const st = seq[i];
    $('#count').textContent = p.type === 'breath' ? `第 ${st.c + 1} / ${a.cycles} 轮` : `第 ${i + 1} / ${seq.length} 步 · 还剩 ${left} 秒`;
    if (p.type === 'breath') orb.textContent = left;
    $('#pbar').style.width = elapsed / total * 100 + '%';
  };
  const enter = () => {
    i++; if (i >= seq.length) { clearInterval(player.timer); return finishAction(a, elapsed); }
    const st = seq[i]; left = st.s;
    if (p.type === 'breath') { orb.style.transitionDuration = st.s + 's'; orb.style.transform = `scale(${st.sc})`; $('#phase').textContent = st.t; $('#guide').textContent = ''; }
    else { $('#phase').textContent = ''; const g = $('#guide'); g.style.opacity = 0; setTimeout(() => { g.textContent = st.t; g.style.opacity = 1; }, 200); }
    show();
  };
  const tick = () => { left--; elapsed++; if (left <= 0) enter(); else show(); };
  goBtn.onclick = () => {
    if (!started) { started = true; running = true; $('#p-end').hidden = false; enter(); player.timer = setInterval(tick, 1000); goBtn.textContent = '暂停'; return; }
    if (running) {
      running = false; clearInterval(player.timer); goBtn.textContent = '继续';
      if (p.type === 'breath') { const m = getComputedStyle(orb).transform; orb.style.transitionDuration = '0s'; orb.style.transform = m; }
      $('#phase').textContent = '已暂停';
    } else {
      running = true; goBtn.textContent = '暂停';
      if (p.type === 'breath') { const st = seq[i]; $('#phase').textContent = st.t; void orb.offsetWidth; orb.style.transitionDuration = left + 's'; orb.style.transform = `scale(${st.sc})`; }
      else $('#phase').textContent = '';
      player.timer = setInterval(tick, 1000);
    }
  };
  $('#p-end').onclick = () => { clearInterval(player.timer); finishAction(a, elapsed, true); };
  openSheet('#player-mask');
}

function openSoundPlayer({ action }) {
  const el = $('#player');
  stopPlayer();
  const st = { kind: action?.sound || 'rain', mins: action?.mins || 10, vol: .6, playing: false, left: (action?.mins || 10) * 60, elapsed: 0 };
  const title = action?.title || '自然声音';
  const meta = () => ({ ...(action || {}), title: action?.title || `听${SOUNDS[st.kind]}`, id: action?.id || 'sound:' + st.kind });
  el.innerHTML = pHead(title) + `<div class="stage sound-stage">
    <div class="now" id="now"><span class="eq"><i></i><i></i><i></i><i></i></span><span id="now-t"></span></div>
    <div class="snd-grid">${Object.entries(SOUNDS).map(([k, n]) => `<button data-snd="${k}" class="${k === st.kind ? 'sel' : ''}">${n}</button>`).join('')}</div>
    <div class="field-t">定时结束</div>
    <div class="lvl">${[[3, '3 分钟'], [5, '5 分钟'], [10, '10 分钟'], [20, '20 分钟'], [0, '不限']].map(([m, t]) => `<button data-min="${m}" class="${m === st.mins ? 'sel' : ''}">${t}</button>`).join('')}</div>
    <label class="vol">音量<input type="range" id="vol" min="0" max="1" step=".05" value=".6"></label></div>
    <div class="pbtns"><button class="btn btn-primary" id="s-play">▶ 播放</button><button class="btn btn-ghost" id="s-end">结束</button></div>`;
  bindClose();
  const fmt = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  const status = () => {
    $('#now').classList.toggle('on', st.playing);
    const rem = st.mins ? ` · 剩余 ${fmt(st.left)}` : ' · 不限时';
    $('#now-t').textContent = st.playing ? `正在播放：${SOUNDS[st.kind]}${rem}` : st.elapsed ? `已暂停：${SOUNDS[st.kind]}${rem}` : `准备好了：${SOUNDS[st.kind]}${rem}`;
    $('#s-play').textContent = st.playing ? '❚❚ 暂停' : '▶ 播放';
  };
  const play = () => {
    if (ambient) { ambient.stop(); ambient = null; }
    if (st.mins && st.left <= 0) st.left = st.mins * 60;
    player.sound = startSound(st.kind, st.vol); st.playing = true;
    clearInterval(player.timer);
    player.timer = setInterval(() => {
      st.elapsed++;
      if (st.mins && --st.left <= 0) { clearInterval(player.timer); st.playing = false; return finishAction(meta(), st.elapsed); }
      status();
    }, 1000);
    status();
  };
  const pause = () => { clearInterval(player.timer); player.sound?.stop(); player.sound = null; st.playing = false; status(); };
  $('#s-play').onclick = () => st.playing ? pause() : play();
  el.querySelectorAll('[data-snd]').forEach(b => b.onclick = () => {
    el.querySelectorAll('[data-snd]').forEach(x => x.classList.toggle('sel', x === b)); st.kind = b.dataset.snd;
    if (st.playing) { player.sound.stop(); player.sound = startSound(st.kind, st.vol); } status();
  });
  el.querySelectorAll('[data-min]').forEach(b => b.onclick = () => {
    el.querySelectorAll('[data-min]').forEach(x => x.classList.toggle('sel', x === b)); st.mins = +b.dataset.min; st.left = st.mins * 60; status();
  });
  $('#vol').oninput = e => { st.vol = +e.target.value; player.sound?.setVol(st.vol); };
  $('#s-end').onclick = () => { if (!st.elapsed) return closePlayer(); pause(); finishAction(meta(), st.elapsed, true); };
  status(); openSheet('#player-mask');
}

function openWriter({ action }) {
  const el = $('#player');
  stopPlayer();
  let pi = action ? action.prompt : Math.floor(Math.random() * WRITE_PROMPTS.length);
  const title = action?.title || '引导书写';
  el.innerHTML = pHead(title) + `<div class="write-box">
    <div class="wprompt" id="wprompt">${WRITE_PROMPTS[pi]}</div><button class="link-btn" id="w-swap">换个问题</button>
    <textarea class="journal" id="wtext" rows="7" placeholder="想到什么就写什么，不用组织语言。"></textarea>
    <p class="chart-note">保存后，它会和这次关怀一起留在小院里；也可以直接放弃，不会留下任何记录。</p></div>
    <div class="pbtns"><button class="btn btn-primary" id="w-save">保存</button><button class="btn btn-ghost" id="w-drop">放弃</button></div>`;
  bindClose();
  const t0 = Date.now();
  $('#w-swap').onclick = () => { pi = (pi + 1) % WRITE_PROMPTS.length; $('#wprompt').textContent = WRITE_PROMPTS[pi]; };
  $('#w-save').onclick = () => {
    const text = $('#wtext').value.trim(); if (!text) return toast('写一个字也可以～');
    finishAction({ ...(action || {}), title, id: action?.id || 'write' }, Math.round((Date.now() - t0) / 1000), false, { text, prompt: WRITE_PROMPTS[pi] });
  };
  $('#w-drop').onclick = () => { if (!$('#wtext').value.trim() || confirm('放弃这段文字吗？它不会被保存。')) closePlayer(); };
  openSheet('#player-mask');
}

// 结束反馈：小物奖励与改善程度无关
function finishAction(a, secs, early, extra = {}) {
  stopPlayer();
  const rec = { id: uid(), ts: Date.now(), action: a.id, title: a.title, secs, fb: null, deco: null, ...extra };
  db.care.push(rec); persist();
  const el = $('#player');
  el.innerHTML = pHead('') + `<div class="stage">
    <img class="done-cat" src="${spriteURL(MISC.catSleep)}" alt="">
    <h2 class="done-t">${early ? '先到这里也很好' : '做完了'}</h2><p class="muted">你刚刚花了一点时间照顾自己。</p>
    <p class="fq">现在感觉怎么样？</p>
    <div class="fb">${Object.entries(FB).map(([k, t]) => `<button data-fb="${k}">${t}</button>`).join('')}<button data-fb="skip" class="quiet">跳过</button></div>
    <p class="chart-note">你的反馈只用来调整以后推荐的顺序。</p></div>`;
  bindClose();
  el.querySelectorAll('[data-fb]').forEach(b => b.onclick = () => {
    if (b.dataset.fb !== 'skip') rec.fb = b.dataset.fb;
    persist(); offerDeco(rec);
  });
  openSheet('#player-mask'); el.scrollTop = 0;
}
function offerDeco(rec) {
  const used = db.care.filter(c => c.deco).map(c => c.deco.type);
  const pool = Object.keys(DECOS).filter(k => !used.slice(-3).includes(k));
  const type = pick(pool.length ? pool : Object.keys(DECOS));
  const el = $('#player');
  el.innerHTML = pHead('') + `<div class="stage">
    ${rec.fb === 'worse' ? `<div class="worse-note">谢谢你如实告诉我。有些时刻，一个人做练习是不够的，这不是你的错。可以找一个信任的人聊聊，或拨打全国心理援助热线 <a href="tel:12356">12356</a>。</div>` : ''}
    <img class="deco-offer" src="${spriteURL(DECOS[type].rows)}" alt="">
    <p class="fq">小晴叼来了一个${DECOS[type].name}</p><p class="muted small">要把它放进小院吗？以后点它，就能想起这一次。</p>
    <div class="pbtns"><button class="btn btn-primary" id="d-yes">放进小院</button><button class="btn btn-ghost" id="d-no">不用了</button></div></div>`;
  bindClose();
  const next = placed => {
    if (placed) { rec.deco = { type }; persist(); chime(); }
    // 从记录过来的，已经记过了，不再问；其他情况可以顺手记一下，但完全可选
    if (player.origin === 'record') { closePlayer(); go('garden'); if (placed) toast(`${DECOS[type].name}放进小院了`); }
    else offerRecord(placed ? DECOS[type].name : '');
  };
  $('#d-yes').onclick = () => next(true);
  $('#d-no').onclick = () => next(false);
}
function offerRecord(decoName) {
  const el = $('#player');
  el.innerHTML = pHead('') + `<div class="stage">
    <div class="done-mark">这次关怀完成了${decoName ? `，${decoName}已经放进小院` : ''}</div>
    <p class="fq">想顺手记一下现在的感觉吗？</p>
    <p class="muted small">选一个最接近的就能种下。不记也完全没关系。</p>
    <div class="bubbles in-sheet">${['calm', 'good', 'tired', 'heavy', 'racing', 'unsure'].map(id => `<button class="bubble" data-rb="${id}" style="--c:${EX[id].color}">${EX[id].text}</button>`).join('')}</div>
    <div class="pbtns"><button class="btn btn-ghost" id="r-no">不用了，回小院</button></div></div>`;
  bindClose();
  el.querySelectorAll('[data-rb]').forEach(b => b.onclick = () => { closePlayer(); go('garden'); openRecord([b.dataset.rb]); });
  $('#r-no').onclick = () => { closePlayer(); go('garden'); };
}

// ======================= 设置 =======================
function openSettings() {
  const c = aiCfg();
  $('#settings').innerHTML = `<div class="grab"></div><div class="sheet-head"><h2>设置</h2><button class="close" data-sx aria-label="关闭">✕</button></div>
    <div class="card"><h3>数据放在哪里</h3>
      <p class="small">日记、关怀记录和小院布置<b>只保存在这台设备的浏览器里</b>。没有账号，也没有我们自己的服务器。</p>
      <p class="small">“保存在哪”和“分析时发给谁”是两件事。页面上每段回应都会标明来源：</p>
      <ul class="small"><li><b>本地规则生成</b>（默认）：回应和回顾都在浏览器里计算，内容不会离开设备。</li>
      <li><b>由大模型生成</b>（需要你自己开启）：生成回应时，会把<b>这一条记录</b>的感受、情境和文字发给你选择的服务商；生成回顾信时，会发送这段时间的统计和<b>最多 8 条</b>原文。</li></ul></div>
    <div class="card"><h3>大模型（可选）</h3>
      <div class="field"><label for="s-provider">服务</label><select id="s-provider"><option value="none">不使用，只用本地规则</option><option value="deepseek">DeepSeek</option><option value="openai">OpenAI 兼容接口（通义、Kimi、智谱等）</option><option value="claude">Anthropic Claude</option></select></div>
      <div id="s-extra"><div class="field"><label for="s-key">API Key</label><input id="s-key" type="password" placeholder="sk-..." value="${esc(c.key)}"></div>
        <div class="field" id="s-base-f"><label for="s-base">接口地址</label><input id="s-base" placeholder="https://api.openai.com/v1" value="${esc(c.base)}"></div>
        <div class="field"><label for="s-model">模型名（可留空）</label><input id="s-model" placeholder="留空使用默认模型" value="${esc(c.model)}"></div>
        <p class="chart-note">Key 只存在本机浏览器，由浏览器直接请求服务商。调用失败时会自动改用本地规则。</p></div>
      <button class="btn btn-primary btn-block" id="s-save">保存</button></div>
    <div class="card"><h3>小院</h3>
      <div class="row2"><button class="btn btn-soft" id="s-demo">${state.mode === 'demo' ? '回到我的小院' : '逛逛示例小院'}</button><button class="btn btn-ghost" id="s-clear">清空我的小院</button></div></div>
    <p class="chart-note center">心晴不能代替专业心理咨询。如果难受持续，请联系专业人士，全国心理援助热线 12356。</p>`;
  const sel = $('#s-provider'); sel.value = c.provider;
  const sync = () => { $('#s-extra').hidden = sel.value === 'none'; $('#s-base-f').hidden = sel.value !== 'openai'; };
  sel.onchange = sync; sync();
  $('[data-sx]').onclick = () => closeSheet('#settings-mask');
  $('#s-save').onclick = () => {
    save(K.ai, { provider: sel.value, key: $('#s-key').value.trim(), base: $('#s-base').value.trim(), model: $('#s-model').value.trim() });
    closeSheet('#settings-mask'); render(); toast(sel.value === 'none' ? '只使用本地规则' : '已保存，下次回应会尝试使用大模型');
  };
  $('#s-demo').onclick = () => { closeSheet('#settings-mask'); state.mode === 'demo' ? exitDemo() : enterDemo(); };
  $('#s-clear').onclick = () => {
    if (state.mode === 'demo') return toast('现在是示例小院，先回到你自己的小院再清空');
    if (!confirm('确定清空你的小院吗？所有记录都会被删除，无法恢复。')) return;
    db = { entries: [], care: [], dismiss: [] }; persist(); closeSheet('#settings-mask'); go('garden'); toast('已清空');
  };
  openSheet('#settings-mask');
}

// ======================= 示例小院（独立数据，不保存） =======================
function enterDemo() { state.mode = 'demo'; state.filter = null; state.expanded = false; db = buildDemo(); go('garden'); toast('欢迎来到示例小院'); }
function exitDemo() { state.mode = 'mine'; state.filter = null; state.expanded = false; loadMine(); go('garden'); toast('回到了你的小院'); }

function buildDemo() {
  // 一位工作第一年的年轻人，三周里的记录。每条的时间都和内容对得上。
  const E = [
    [20, '08:40', ['racing'], 3, ['工作', '通勤'], '通勤路上一直在想今天的汇报，地铁坐过了一站。'],
    [20, '22:30', ['tired', 'content'], 3, ['工作'], '汇报总算结束了，被夸了一句，但整个人被掏空。'],
    [19, '12:50', ['calm'], 2, ['饮食', '独处'], '午饭一个人去吃了拉面，安安静静的半小时。'],
    [18, '23:40', ['racing', 'tense'], 4, ['睡眠', '未来'], '躺下一个多小时还睡不着，脑子里在排明天的待办。'],
    [17, '09:20', ['tired'], 4, ['睡眠'], '只睡了五个小时，眼睛干得发疼。'],
    [17, '19:50', ['fire'], 3, ['工作', '人际'], '下班前同事把没做完的活推给我，还说“你顺手弄一下”。'],
    [16, '21:00', ['unsure'], 3, [], ''],
    [15, '16:30', ['good', 'warm'], 4, ['朋友', '自然'], '和大学室友去爬山，山顶风很大，笑得很开心。'],
    [14, '20:10', ['calm', 'content'], 3, ['独处', '爱好'], '在家拼完了一个小积木，一整个晚上没看手机。'],
    [13, '08:50', ['tense'], 3, ['工作'], '早上看到日程排满了，胃有点紧。'],
    [13, '23:15', ['heavy'], 3, ['家人'], '和妈妈视频，她又问起换工作的事，挂了电话心里堵堵的。'],
    [12, '12:40', ['hurt'], 3, ['工作', '人际'], '上午会上，我出的点子被说成是组长的想法。'],
    [11, '19:30', ['content'], 3, ['运动'], '下班去跑了三公里，出了一身汗，脑子清爽多了。'],
    [10, '22:50', ['racing', 'heavy'], 4, ['未来'], '刷到同学读研、出国的消息，又开始想自己是不是走错了路，感觉总是比别人慢。'],
    [9, '10:15', ['unsure', 'tired'], 2, ['身体'], '说不上哪里不舒服，就是提不起劲。'],
    [8, '18:20', ['good'], 3, ['朋友', '饮食'], '朋友来家里吃火锅，热热闹闹的。'],
    [7, '12:30', ['calm'], 2, ['自然'], '午休去楼下公园晒太阳，看老人下棋。'],
    [6, '09:05', ['tense', 'racing'], 3, ['工作'], '例会前心跳很快，提前做了两轮呼吸。'],
    [6, '21:40', ['content', 'tired'], 3, ['工作'], '例会比想象中顺利，组长说下次让我主讲。累，但有点开心。'],
    [5, '23:30', ['empty', 'heavy'], 3, ['人际', '睡眠'], '看到朋友们在群里聊一个我不知道的聚会，有点空落落的。'],
    [4, '13:30', ['warm'], 4, ['人际'], '午饭时同事记得我不吃香菜，特意帮我备注了。'],
    [3, '19:20', ['fire', 'tired'], 3, ['通勤'], '地铁故障堵了四十分钟，到家已经没力气做饭。'],
    [2, '22:10', ['calm'], 2, ['独处', '睡眠'], '睡前泡了脚，听了一会儿雨声，今天早点睡。'],
    [1, '08:30', ['racing'], 2, ['工作'], '今天要交季度总结，还剩一部分数据没核对。'],
    [1, '20:45', ['good', 'content'], 3, ['工作'], '总结交上去了，给自己买了一杯喜欢的奶茶。'],
  ];
  const C = [
    [18, '23:55', 'rain3', 'better', 'lantern'], [17, '20:10', 'shake2', 'better', 'pumpkin'],
    [13, '23:30', 'write3', 'better', 'mailbox', '妈妈的担心其实是爱，但我也需要她相信我。', 0],
    [10, '23:05', 'breath1', 'same', null], [9, '10:30', 'stretch3', 'better', 'can'],
    [6, '09:10', 'breath1', 'better', 'stone'], [5, '23:45', 'rain3', 'better', 'bench'],
    [3, '19:40', 'walk5', 'same', 'birdbath'], [2, '22:20', 'rain3', 'better', null], [1, '08:40', 'ground3', 'worse', null],
  ];
  const at = (daysAgo, hm) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); const [h, m] = hm.split(':'); d.setHours(+h, +m, 0, 0); return d.getTime(); };
  const plants = Object.keys(PLANTS);
  const entries = E.map(([da, hm, exprs, it, ctx, text], i) => {
    const e = { id: 'demo' + i, ts: at(da, hm), exprs, intensity: it, ctx, text, plant: plants[(i * 7) % plants.length] };
    e.reply = { text: REPLY[mainFam(e)][i % 2] + (e.ctx.find(x => CTX_LINE[x]) && tone(e) !== 'comfy' ? '\n\n' + CTX_LINE[e.ctx.find(x => CTX_LINE[x])] : ''), src: 'local' };
    return e;
  });
  const care = C.map(([da, hm, act, fb, deco, text, p], i) => ({
    id: 'dcare' + i, ts: at(da, hm), action: act, title: ACT[act].title, secs: ACT[act].mins * 60, fb,
    deco: deco ? { type: deco } : null, ...(text ? { text, prompt: WRITE_PROMPTS[p] } : {}),
  }));
  return { entries, care, dismiss: [] };
}

// ======================= 启动 =======================
loadMine();
render();
syncSound();
// 浏览器要求用户先有一次操作才能出声：记住了“开声音”的话，在第一次点击时恢复
document.addEventListener('pointerdown', () => { if (soundOn) { ac(); syncSound(); } }, { once: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopCat(); else if (state.tab === 'garden' && !catCtl) startCat(); });
