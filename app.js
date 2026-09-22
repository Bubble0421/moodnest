/* 心晴 MoodNest —— 情绪日记与自我关怀
 * 纯前端单页应用：数据保存在浏览器 localStorage；
 * AI 回应默认使用本地规则引擎，可在设置中接入自己的大模型 API。
 */

// ======================= 基础数据 =======================
const EMOTIONS = [
  { id: 'happy',    name: '开心', emoji: '😊', color: '#F4B860', v: 1 },
  { id: 'calm',     name: '平静', emoji: '😌', color: '#8FB39A', v: 0.6 },
  { id: 'grateful', name: '感恩', emoji: '🥰', color: '#F29E8E', v: 0.9 },
  { id: 'tired',    name: '疲惫', emoji: '😮‍💨', color: '#B8A99A', v: -0.5 },
  { id: 'anxious',  name: '焦虑', emoji: '😰', color: '#9C8FD0', v: -0.9 },
  { id: 'sad',      name: '低落', emoji: '😢', color: '#7FA3C8', v: -1 },
  { id: 'angry',    name: '生气', emoji: '😤', color: '#E07A6B', v: -0.9 },
  { id: 'wronged',  name: '委屈', emoji: '🥺', color: '#C9A0B8', v: -0.7 },
];
const EMO = Object.fromEntries(EMOTIONS.map(e => [e.id, e]));

const TRIGGER_GROUPS = [
  { name: '压力来源', items: ['工作', '学业', '人际', '家庭', '恋爱', '金钱', '未来'] },
  { name: '身体状态', items: ['睡眠', '身体', '天气'] },
  { name: '能量来源', items: ['运动', '朋友', '美食', '自然', '独处', '爱好'] },
];
const TRIG_EMOJI = { 工作: '💼', 学业: '📚', 人际: '👥', 家庭: '🏠', 恋爱: '💗', 金钱: '💰', 未来: '🔮', 睡眠: '🌙', 身体: '🩺', 天气: '🌦️', 运动: '🏃', 朋友: '🧑‍🤝‍🧑', 美食: '🍜', 自然: '🌳', 独处: '🫖', 爱好: '🎨' };

const JOURNAL_PROMPTS = ['发生了什么？', '身体有什么感觉？', '我脑海里冒出的想法是…', '如果好朋友遇到这件事，我会对 TA 说…', '今天有一件小确幸…'];

// ======================= 疗愈工具 =======================
const TOOLS = [
  { id: 'breath478', name: '4-7-8 呼吸', icon: '🌬️', cat: '呼吸', mins: 2, desc: '激活副交感神经，快速平复紧张与心跳',
    type: 'breath', cycles: 4, phases: [{ t: '吸气', s: 4, sc: 1 }, { t: '屏息', s: 7, sc: 1 }, { t: '缓缓呼气', s: 8, sc: .55 }] },
  { id: 'box', name: '箱式呼吸', icon: '🟫', cat: '呼吸', mins: 2, desc: '海豹突击队也在用的专注呼吸法',
    type: 'breath', cycles: 6, phases: [{ t: '吸气', s: 4, sc: 1 }, { t: '屏息', s: 4, sc: 1 }, { t: '呼气', s: 4, sc: .55 }, { t: '屏息', s: 4, sc: .55 }] },
  { id: 'grounding', name: '5-4-3-2-1 着陆', icon: '🖐️', cat: '冥想', mins: 3, desc: '用五感把注意力拉回当下，缓解焦虑与恐慌',
    type: 'steps', steps: [
      { t: '找一个舒服的姿势，轻轻做三次深呼吸。', s: 15 },
      { t: '👀 环顾四周，说出你能看到的 5 样东西。', s: 30 },
      { t: '✋ 感受你能触摸到的 4 样东西：衣服的质地、椅子、脚下的地面……', s: 30 },
      { t: '👂 仔细听，找出 3 种声音。', s: 25 },
      { t: '👃 留意 2 种气味，哪怕很淡。', s: 20 },
      { t: '👅 感受 1 种味道，或者嘴里此刻的感觉。', s: 15 },
      { t: '你已经回到了此时此地。你是安全的。', s: 12 },
    ] },
  { id: 'bodyscan', name: '身体扫描', icon: '🫧', cat: '冥想', mins: 4, desc: '从头到脚放松，释放积攒在身体里的紧绷',
    type: 'steps', steps: [
      { t: '闭上眼睛，感受身体和椅子、地面接触的地方。', s: 20 },
      { t: '把注意力带到额头和眉心，让它们舒展开。', s: 25 },
      { t: '放松下巴，让舌头轻轻离开上颚。', s: 20 },
      { t: '感受肩膀，吸气时耸起，呼气时让它重重落下。', s: 30 },
      { t: '留意胸口和腹部，随着呼吸自然起伏。', s: 30 },
      { t: '感受双手，想象暖流从手心流过。', s: 25 },
      { t: '双腿、双脚，感受它们稳稳地踩在地上。', s: 25 },
      { t: '整个身体作为一个整体，轻轻呼吸。准备好了再睁开眼睛。', s: 20 },
    ] },
  { id: 'compassion', name: '自我关怀三句话', icon: '🤍', cat: '冥想', mins: 2, desc: '心理学家 Kristin Neff 的自我关怀练习',
    type: 'steps', steps: [
      { t: '把一只手轻轻放在胸口，感受它的温度。', s: 15 },
      { t: '对自己说：「这一刻真的很难受。」\n承认痛苦，而不是推开它。', s: 25 },
      { t: '对自己说：「难受是生活的一部分，不只是我一个人会这样。」', s: 25 },
      { t: '对自己说：「愿我能对自己温柔一点。」', s: 25 },
      { t: '如果此刻你最好的朋友也经历这些，你会对 TA 说什么？\n把这句话也送给自己。', s: 30 },
    ] },
  { id: 'walk', name: '5 分钟散步', icon: '🚶', cat: '运动', mins: 5, desc: '离开座位，换个环境，情绪会跟着身体移动',
    type: 'steps', steps: [
      { t: '站起来，走出房间或走到窗边。', s: 30 },
      { t: '放慢脚步，感受每一步脚掌落地。', s: 60 },
      { t: '抬头看看天空，找一朵云或一片树叶。', s: 60 },
      { t: '甩甩手臂，转转脖子，让身体松下来。', s: 60 },
      { t: '回想今天一件还不错的小事，哪怕很小。', s: 60 },
      { t: '做三次深呼吸，然后慢慢走回来。', s: 30 },
    ] },
  { id: 'stretch', name: '工位拉伸', icon: '🙆', cat: '运动', mins: 3, desc: '久坐党的救星，唤醒僵硬的肩颈',
    type: 'steps', steps: [
      { t: '颈部：头缓慢向右倾，保持 15 秒，再换左边。', s: 30 },
      { t: '肩膀：双肩向后画圈 10 次，再向前 10 次。', s: 30 },
      { t: '胸部：双手在背后交握，挺胸向上抬手臂。', s: 25 },
      { t: '侧腰：右手举过头顶向左弯，停 15 秒，换边。', s: 30 },
      { t: '手腕：伸直手臂，另一只手轻拉手指向后。', s: 25 },
      { t: '最后，伸一个大大的懒腰！', s: 15 },
    ] },
  { id: 'shake', name: '抖动释放', icon: '💃', cat: '运动', mins: 2, desc: '把愤怒和烦躁“抖”出身体，适合一肚子火的时候',
    type: 'steps', steps: [
      { t: '站起来，双脚与肩同宽。', s: 10 },
      { t: '先抖动双手，越来越用力，像要甩掉水珠。', s: 20 },
      { t: '加上手臂和肩膀，一起抖！', s: 20 },
      { t: '膝盖也跟着弹动起来，全身都在抖。', s: 25 },
      { t: '可以发出声音——「哈！」把情绪呼出去。', s: 15 },
      { t: '慢慢停下来，站定，感受身体里的震动和热度。', s: 20 },
    ] },
  { id: 'sounds', name: '自然白噪音', icon: '🌧️', cat: '声音', mins: 0, desc: '雨声、海浪、微风，帮你专注或入睡', type: 'sound' },
  { id: 'music', name: '情绪歌单', icon: '🎧', cat: '音乐', mins: 0, desc: '根据此刻的心情，为你挑几首歌', type: 'music' },
  { id: 'gratitude', name: '三件好事', icon: '✨', cat: '书写', mins: 3, desc: '积极心理学经典练习，每天写下三件好事', type: 'gratitude' },
];
const TOOL = Object.fromEntries(TOOLS.map(t => [t.id, t]));

// 情绪 → 推荐的工具（按优先级）
const REC_MAP = {
  anxious: ['breath478', 'grounding', 'box', 'sounds', 'music'],
  angry: ['shake', 'breath478', 'walk', 'bodyscan', 'music'],
  sad: ['compassion', 'walk', 'music', 'gratitude', 'sounds'],
  wronged: ['compassion', 'music', 'walk', 'breath478'],
  tired: ['stretch', 'bodyscan', 'sounds', 'walk', 'music'],
  calm: ['gratitude', 'bodyscan', 'sounds', 'music'],
  happy: ['gratitude', 'music', 'walk'],
  grateful: ['gratitude', 'music', 'compassion'],
};

const PLAYLISTS = {
  soothe: { name: '安抚焦虑 · 慢下来', for: ['anxious', 'angry'], songs: [
    ['Weightless', 'Marconi Union'], ['月光 Clair de Lune', 'Debussy'], ['River Flows in You', 'Yiruma'], ['Nuvole Bianche', 'Ludovico Einaudi'] ] },
  hug: { name: '低落时的拥抱', for: ['sad', 'wronged'], songs: [
    ['Fix You', 'Coldplay'], ['平凡之路', '朴树'], ['Let It Be', 'The Beatles'], ['玫瑰少年', '五月天'] ] },
  recharge: { name: '疲惫时的充电', for: ['tired'], songs: [
    ['Summer', '久石让'], ['Here Comes the Sun', 'The Beatles'], ['晴天', '周杰伦'], ['Lovely Day', 'Bill Withers'] ] },
  shine: { name: '把好心情延续下去', for: ['happy', 'grateful', 'calm'], songs: [
    ['Happy', 'Pharrell Williams'], ['小幸运', '田馥甄'], ['Walking on Sunshine', 'Katrina & The Waves'], ['稻香', '周杰伦'] ] },
};

// ======================= 存储 =======================
const LS = { entries: 'mn_entries', care: 'mn_care', ai: 'mn_ai', grat: 'mn_grat' };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const state = {
  entries: load(LS.entries, []),
  care: load(LS.care, []),
  tab: 'home',
  range: 7,
  careMood: null,
  careCat: '全部',
};
const persist = () => { save(LS.entries, state.entries); save(LS.care, state.care); };

// ======================= 工具函数 =======================
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => { d = new Date(d); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const hm = d => { d = new Date(d); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
const pick = a => a[Math.floor(Math.random() * a.length)];
const score = e => Math.max(0, Math.min(10, 5 + EMO[e.emotion].v * e.intensity));
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}
function openSheet(id) { $(id).classList.add('show'); document.body.style.overflow = 'hidden'; }
function closeSheet(id) { $(id).classList.remove('show'); document.body.style.overflow = ''; }
document.querySelectorAll('.sheet-mask').forEach(m => m.addEventListener('click', e => {
  if (e.target === m) { if (m.id === 'player-mask') stopPlayer(); closeSheet('#' + m.id); }
}));

function daysInRange(n) {
  const out = [], now = new Date();
  for (let i = n - 1; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); out.push(ymd(d)); }
  return out;
}
function entriesIn(n) {
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (n - 1));
  return state.entries.filter(e => e.ts >= start.getTime());
}
function streak() {
  const days = new Set(state.entries.map(e => ymd(e.ts)));
  let n = 0; const d = new Date();
  if (!days.has(ymd(d))) d.setDate(d.getDate() - 1);
  while (days.has(ymd(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// ======================= 情绪小树 =======================
const TREE_LEVELS = [
  { name: '一颗种子', need: 0 }, { name: '破土发芽', need: 3 }, { name: '小小树苗', need: 10 },
  { name: '枝叶渐茂', need: 25 }, { name: '开花的树', need: 50 }, { name: '硕果满枝', need: 90 },
];
function treeInfo() {
  const days = new Set(state.entries.map(e => ymd(e.ts))).size;
  const pts = days * 1 + state.entries.length * 0.5 + state.care.length * 1;
  let lv = 0; TREE_LEVELS.forEach((l, i) => { if (pts >= l.need) lv = i; });
  const next = TREE_LEVELS[lv + 1];
  const pct = next ? (pts - TREE_LEVELS[lv].need) / (next.need - TREE_LEVELS[lv].need) : 1;
  return { lv, pts: Math.floor(pts), next, pct: Math.min(1, pct), name: TREE_LEVELS[lv].name };
}
function treeSVG(lv) {
  const g = '<ellipse cx="60" cy="112" rx="46" ry="8" fill="#C9B79C" opacity=".45"/><path d="M18 110 Q60 100 102 110 L102 116 Q60 122 18 116Z" fill="#B99A7A"/>';
  if (lv === 0) return `<svg viewBox="0 0 120 125" width="120">${g}<ellipse cx="60" cy="104" rx="9" ry="7" fill="#9B6B45"/><path d="M60 97 q3 -5 0 -8" stroke="#7FA88C" stroke-width="2" fill="none"/></svg>`;
  const h = [0, 22, 38, 52, 62, 66][lv];
  const trunk = `<path d="M57 108 Q${58} ${108 - h / 2} 59 ${108 - h} L61 ${108 - h} Q62 ${108 - h / 2} 63 108Z" fill="#9B6B45"/>`;
  if (lv === 1) return `<svg viewBox="0 0 120 125" width="120">${g}${trunk}<ellipse cx="52" cy="84" rx="9" ry="5" fill="#8FC19C" transform="rotate(-30 52 84)"/><ellipse cx="68" cy="84" rx="9" ry="5" fill="#7FA88C" transform="rotate(30 68 84)"/></svg>`;
  const top = 108 - h, R = [0, 0, 18, 26, 32, 34][lv];
  const blobs = [[0, 0, 1], [-.6, .35, .75], [.6, .35, .75], [-.35, -.45, .7], [.4, -.4, .7]].slice(0, lv + 1)
    .map(([x, y, r], i) => `<circle cx="${60 + x * R}" cy="${top + y * R}" r="${R * r}" fill="${['#7FA88C', '#8FC19C', '#6E9B7B', '#9CCBA8', '#86B592'][i]}"/>`).join('');
  let deco = '';
  if (lv >= 4) deco += [[-18, -6], [14, -14], [4, 10], [-8, -22], [22, 6]].map(([x, y]) => `<circle cx="${60 + x}" cy="${top + y}" r="3.2" fill="#F7B7A3"/><circle cx="${60 + x}" cy="${top + y}" r="1.2" fill="#FFF3C4"/>`).join('');
  if (lv >= 5) deco += [[-24, 10], [20, 16], [-4, -8]].map(([x, y]) => `<circle cx="${60 + x}" cy="${top + y}" r="4.5" fill="#E8795E"/>`).join('');
  return `<svg viewBox="0 0 120 125" width="120">${g}${trunk}<g class="leaves">${blobs}</g>${deco}</svg>`;
}

// ======================= 本地 AI 引擎 =======================
const EMPATHY = {
  happy: ['真好呀，能感受到你此刻的轻快 ✨ 这份开心值得被好好记住。', '看到你开心，我也跟着开心起来了！'],
  calm: ['平静是很珍贵的状态，就像湖面没有风。', '能在忙碌里保持一份平静，你做得很好。'],
  grateful: ['心怀感恩的时候，世界好像也变温柔了。', '谢谢你把这份温暖记下来，它会在低谷时照亮你。'],
  tired: ['辛苦了，你已经撑了很久。累不是软弱，是身体在提醒你该停一停了。', '先别急着要求自己，允许自己慢一点、歇一会儿。'],
  anxious: ['焦虑的时候，心好像被一根绳子揪着，对吧？你愿意把它写下来，已经是在松开那根绳子了。', '我听到了你的不安。焦虑往往是因为你很在乎，这份在乎本身没有错。'],
  sad: ['难过的时候不用急着好起来，我在这里陪着你。', '抱抱你。低落的情绪就像阴天，它会过去的，而你不必独自等待。'],
  angry: ['生气是很正常的情绪，它通常在告诉你：有些边界被越过了。', '感受到你的火气了。先让这股能量有个出口，再决定要怎么做。'],
  wronged: ['被误解、被忽视的感觉真的很难受，你的委屈是真实的。', '抱抱你。你的感受很重要，不需要别人认可也值得被看见。'],
};
const TRIGGER_LINE = {
  工作: '工作的压力常常悄悄堆积。试着区分一下：哪些事是你能控制的，哪些不是？',
  学业: '学业压力大的时候，把大目标拆成今天能完成的一小步，会轻松很多。',
  人际: '人际关系里的摩擦最耗心力。你的感受是合理的，不必全部归咎于自己。',
  家庭: '和家人之间的情绪往往更复杂，因为爱和期待交织在一起。',
  恋爱: '亲密关系里的起伏，也是在让你更了解自己需要什么。',
  金钱: '经济压力带来的不安很现实，把担心具体写成清单，会比在脑子里打转更有掌控感。',
  未来: '对未来的担忧常常来自不确定。试着只关注接下来 24 小时可以做的一件事。',
  睡眠: '睡不好会放大所有情绪。今晚可以试试睡前放下手机 30 分钟，听听白噪音。',
  身体: '身体不舒服时情绪低一点很正常，先好好照顾身体。',
  天气: '天气也会影响心情，找点温暖明亮的小事来对冲一下吧。',
  运动: '运动是你的能量来源之一，记得多给自己安排一点！',
  朋友: '和朋友在一起的时光是你的充电站，好好珍惜这些连接。',
  美食: '好吃的东西真的能治愈人，好好享受这一口吧。',
  自然: '大自然总能让人放松下来，下次难过时可以多出去走走。',
  独处: '独处是和自己相处的好时机，你很懂得照顾自己。',
  爱好: '做喜欢的事时的专注和快乐，是很好的情绪资源。',
};
const DISTORTIONS = [
  { name: '以偏概全', re: /总是|永远|每次|从来|一直都|所有人|没有人/, tip: '真的每一次都这样吗？试着找出一个“例外”。' },
  { name: '灾难化想象', re: /完了|完蛋|肯定会|搞砸|毁了|没救|彻底失败/, tip: '最坏的情况真的会发生吗？就算发生了，你会怎么应对？' },
  { name: '“应该”思维', re: /应该|必须|不得不|本该/, tip: '把“我应该”换成“我希望”，感受一下有什么不同。' },
  { name: '自我贴标签', re: /我就是个|我真没用|废物|失败者|我好差|我太笨|一无是处/, tip: '一件事没做好，不等于你这个人不好。' },
  { name: '读心术', re: /肯定觉得|一定认为|都觉得我|讨厌我|看不起我|嫌弃我/, tip: '你有证据证明对方真的这么想吗？有没有其他可能？' },
  { name: '过度自责', re: /都怪我|我的错|都是因为我/, tip: '想想哪些因素其实不在你的控制范围内。' },
];
const CRISIS_RE = /不想活|想死|去死|自杀|轻生|结束生命|活着没意思|活着没有意义|伤害自己|自残|割腕|跳楼/;

function detectDistortions(text) { return DISTORTIONS.filter(d => d.re.test(text || '')); }

function recommendTools(emotion, n = 3) {
  const base = REC_MAP[emotion] || ['breath478', 'music', 'walk'];
  // 个性化：参考用户过往对各工具的反馈，效果越好排序越靠前
  const eff = toolEffectiveness();
  return [...base].sort((a, b) => (eff[b]?.score ?? 0) - (eff[a]?.score ?? 0) + (base.indexOf(a) - base.indexOf(b)) * 0.15).slice(0, n);
}
function toolEffectiveness() {
  const m = {};
  state.care.forEach(c => {
    if (!c.fb) return;
    m[c.tool] = m[c.tool] || { n: 0, sum: 0 };
    m[c.tool].n++; m[c.tool].sum += { better: 2, bit: 1, same: 0 }[c.fb] ?? 0;
  });
  Object.values(m).forEach(v => v.score = v.sum / v.n);
  return m;
}

function localReply(entry) {
  const e = EMO[entry.emotion];
  const parts = [pick(EMPATHY[entry.emotion])];
  const t = entry.triggers.find(x => TRIGGER_LINE[x]);
  if (t) parts.push(TRIGGER_LINE[t]);
  const recs = recommendTools(entry.emotion, 1);
  if (e.v < 0) parts.push(`如果愿意，可以试试「${TOOL[recs[0]].name}」，只需要几分钟。`);
  else parts.push('把这份好感受存进日记里，低落的时候回来看看。');
  return parts.join('\n\n');
}

// ======================= 大模型接入 =======================
const aiCfg = () => load(LS.ai, { provider: 'none', key: '', model: '', base: '' });

async function callLLM(system, user) {
  const c = aiCfg();
  if (c.provider === 'none' || !c.key) throw new Error('未配置');
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    if (c.provider === 'claude') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', signal: ctrl.signal,
        headers: { 'content-type': 'application/json', 'x-api-key': c.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: c.model || 'claude-sonnet-5', max_tokens: 800, system, messages: [{ role: 'user', content: user }] }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json(); return d.content.map(x => x.text || '').join('').trim();
    }
    const base = (c.base || (c.provider === 'deepseek' ? 'https://api.deepseek.com' : 'https://api.openai.com/v1')).replace(/\/$/, '');
    const r = await fetch(base + '/chat/completions', {
      method: 'POST', signal: ctrl.signal,
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + c.key },
      body: JSON.stringify({ model: c.model || (c.provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini'), temperature: 0.8,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json(); return d.choices[0].message.content.trim();
  } finally { clearTimeout(timer); }
}

const SYS_REPLY = `你是「心晴」App 里一位温暖、真诚的情绪陪伴者，理念来自认知行为疗法（CBT）与自我关怀（self-compassion）。
用户刚记录了一条情绪日记。请用中文回复 80~150 字：
1. 先具体地共情，复述你感受到的情绪，不说教、不空泛安慰；
2. 如果用户的想法里有明显的认知偏差，用温柔的提问方式引导 TA 换个角度看；
3. 最后给一个此刻就能做的小建议。
语气像一位懂心理学的好朋友，可以用 1 个 emoji。不要使用标题或列表。你不是心理医生，不做诊断。`;

async function genReply(entry) {
  const e = EMO[entry.emotion];
  const user = `情绪：${e.name}（强度 ${entry.intensity}/5）\n触发因素：${entry.triggers.join('、') || '未选择'}\n日记：${entry.text || '（没有写文字）'}`;
  try { return { text: await callLLM(SYS_REPLY, user), src: 'ai' }; }
  catch (err) { return { text: localReply(entry), src: 'local', err: aiCfg().provider !== 'none' ? err.message : '' }; }
}

// ======================= 渲染：首页 =======================
function renderHome() {
  const h = new Date().getHours();
  const greet = h < 5 ? '夜深了' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
  const d = new Date();
  const today = state.entries.filter(e => ymd(e.ts) === ymd(d)).sort((a, b) => b.ts - a.ts);
  const tree = treeInfo();
  const last = state.entries.slice().sort((a, b) => b.ts - a.ts)[0];
  const week = entriesIn(7);

  let html = `
  <div class="hello">
    <h1>${greet} 👋</h1>
    <p>${d.getMonth() + 1}月${d.getDate()}日 星期${WEEK[d.getDay()]} · ${h >= 22 || h < 5 ? '记录完今天的心情，就早点休息吧' : '照顾好自己，是最重要的事'}</p>
  </div>

  <div class="card checkin">
    <div class="q">此刻，你感觉怎么样？</div>
    <div class="emo-quick">
      ${EMOTIONS.map(e => `<button data-quick="${e.id}"><span class="e">${e.emoji}</span>${e.name}</button>`).join('')}
    </div>
    <div class="hint">点一下就能开始，10 秒完成记录</div>
  </div>`;

  if (!state.entries.length) {
    html += `
    <div class="card demo-card">
      <div style="font-size:34px">🗂️</div>
      <b>第一次来？</b>
      <p class="muted small" style="margin:4px 0 12px">可以先载入 30 天的示例数据，<br>体验情绪分析和个性化推荐的效果</p>
      <button class="btn btn-soft" id="btn-demo">载入示例数据</button>
    </div>`;
  }

  html += `
  <div class="card tree-card">
    ${treeSVG(tree.lv)}
    <div class="grow">
      <div class="muted small">我的情绪小树</div>
      <div class="lv">Lv.${tree.lv + 1} ${tree.name}</div>
      <div class="progress"><i style="width:${tree.pct * 100}%"></i></div>
      <div class="muted small">${tree.next ? `再积累 ${Math.ceil(tree.next.need - tree.pts)} 点成长值升级` : '已经长成最茂盛的样子啦 🎉'}<br>记录情绪、完成疗愈练习都能让它长大</div>
    </div>
  </div>

  <div class="stats3">
    <div class="stat"><b>${streak()}</b><span>连续记录(天)</span></div>
    <div class="stat"><b>${week.length}</b><span>本周记录</span></div>
    <div class="stat"><b>${week.length ? avg(week.map(score)).toFixed(1) : '–'}</b><span>本周心情分</span></div>
  </div>`;

  if (last) {
    const recs = recommendTools(last.emotion, 3);
    html += `
    <div class="section-title"><span>🌿 为你推荐</span><span class="muted small" style="font-weight:400">基于最近的「${EMO[last.emotion].name}」</span></div>
    <div class="rec-row">${recs.map(toolCard).join('')}</div>`;
  }

  html += `<div class="section-title"><span>📝 今天的记录</span>${state.entries.length ? '<span class="link" data-go="diary">全部日记 ›</span>' : ''}</div>`;
  html += today.length ? today.map(entryCard).join('') : `<div class="empty"><div class="big">🍃</div>今天还没有记录，<br>点上面的表情开始吧</div>`;
  return html;
}

function toolCard(id) {
  const t = TOOL[id];
  return `<button class="tool" data-tool="${id}"><span class="ic">${t.icon}</span><span class="nm">${t.name}</span><span class="ds">${t.desc}</span><span class="tm">${t.mins ? `约 ${t.mins} 分钟` : '随时开始'} ›</span></button>`;
}

function entryCard(e) {
  const em = EMO[e.emotion];
  return `
  <div class="entry" data-entry="${e.id}">
    <div class="dot" style="background:${em.color}33">${em.emoji}</div>
    <div class="grow">
      <div class="row"><span class="title">${em.name}</span><span class="intensity">${'●'.repeat(e.intensity)}${'○'.repeat(5 - e.intensity)}</span><span class="meta" style="margin-left:auto">${hm(e.ts)}</span></div>
      ${e.text ? `<div class="txt">${esc(e.text)}</div>` : ''}
      ${e.triggers.length ? `<div class="tags">${e.triggers.map(t => `<span class="chip gray">${TRIG_EMOJI[t] || ''} ${t}</span>`).join('')}</div>` : ''}
      ${e.reply ? `<div class="reply">🌱 ${esc(e.reply.text)}</div>` : ''}
      <button class="del" data-del="${e.id}" style="display:none">删除这条记录</button>
    </div>
  </div>`;
}

// ======================= 渲染：日记 =======================
function renderDiary() {
  if (!state.entries.length) return `<div class="empty" style="padding-top:80px"><div class="big">📔</div>还没有日记<br><span class="small">点击下方 ＋ 记录第一条情绪</span></div>`;
  const groups = {};
  state.entries.slice().sort((a, b) => b.ts - a.ts).forEach(e => (groups[ymd(e.ts)] = groups[ymd(e.ts)] || []).push(e));
  let html = `<div class="hello"><h1>情绪日记</h1><p>共 ${state.entries.length} 条记录 · 点击卡片查看小晴的回应</p></div>`;
  for (const [day, list] of Object.entries(groups)) {
    const d = new Date(day + 'T00:00');
    const label = day === ymd(new Date()) ? '今天' : day === ymd(Date.now() - 864e5) ? '昨天' : `${d.getMonth() + 1}月${d.getDate()}日`;
    html += `<div class="day-head"><span>${label} · 周${WEEK[d.getDay()]}</span><span>${list.map(e => EMO[e.emotion].emoji).join('')}</span></div>`;
    html += list.map(entryCard).join('');
  }
  return html;
}

// ======================= 渲染：洞察 =======================
function renderInsight() {
  const n = state.range;
  const list = entriesIn(n);
  let html = `<div class="hello row"><div class="grow"><h1>情绪洞察</h1><p>看见情绪背后的规律</p></div>
    <div class="seg">${[7, 30].map(k => `<button data-range="${k}" class="${k === n ? 'sel' : ''}">${k}天</button>`).join('')}</div></div>`;
  if (list.length < 3) {
    return html + `<div class="empty" style="padding-top:50px"><div class="big">🔍</div>最近 ${n} 天的记录还不够多（${list.length} 条）<br>多记录几次，规律就会浮现<br><br>${state.entries.length ? '' : '<button class="btn btn-soft" id="btn-demo">载入示例数据看看效果</button>'}</div>`;
  }

  const avgScore = avg(list.map(score));
  const cnt = {}; list.forEach(e => cnt[e.emotion] = (cnt[e.emotion] || 0) + 1);
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0];
  const negRatio = list.filter(e => EMO[e.emotion].v < 0).length / list.length;

  html += `<div class="stats3">
    <div class="stat"><b>${list.length}</b><span>记录次数</span></div>
    <div class="stat"><b>${avgScore.toFixed(1)}</b><span>平均心情分</span></div>
    <div class="stat"><b>${EMO[top].emoji}</b><span>最常出现：${EMO[top].name}</span></div>
  </div>`;

  html += `<div class="card"><h3>📈 心情曲线 <span class="sub">每日平均分（0~10）</span></h3>${trendChart(n, list)}</div>`;

  html += `<div class="card"><h3>🎨 情绪分布</h3>${EMOTIONS.filter(e => cnt[e.id]).sort((a, b) => cnt[b.id] - cnt[a.id]).map(e => `
    <div class="bar-row"><span>${e.emoji} ${e.name}</span><span class="track"><i style="width:${cnt[e.id] / list.length * 100}%;background:${e.color}"></i></span><span class="v">${Math.round(cnt[e.id] / list.length * 100)}%</span></div>`).join('')}
    <p class="muted small" style="margin:10px 0 0">积极情绪占 ${Math.round((1 - negRatio) * 100)}%，${negRatio > .6 ? '最近压力不小，要多照顾自己哦。' : negRatio > .4 ? '整体有起有落，是很真实的状态。' : '整体状态不错，继续保持！'}</p></div>`;

  const trig = triggerStats(list);
  const drain = trig.filter(t => t.avg < 5).sort((a, b) => a.avg - b.avg).slice(0, 4);
  const fuel = trig.filter(t => t.avg >= 5.5).sort((a, b) => b.avg - a.avg).slice(0, 4);
  html += `<div class="card"><h3>🧭 触发因素分析</h3>
    <div class="trig-cols">
      <div class="trig-col"><h4>🌧️ 消耗你的</h4>${drain.length ? drain.map(t => `<div class="trig-item">${TRIG_EMOJI[t.name] || ''} <b>${t.name}</b> <span class="s">· ${t.n} 次</span><div class="s">常伴随「${EMO[t.topEmo].name}」· 心情 ${t.avg.toFixed(1)}</div></div>`).join('') : '<p class="muted small">暂无明显消耗项</p>'}</div>
      <div class="trig-col"><h4>☀️ 滋养你的</h4>${fuel.length ? fuel.map(t => `<div class="trig-item">${TRIG_EMOJI[t.name] || ''} <b>${t.name}</b> <span class="s">· ${t.n} 次</span><div class="s">常伴随「${EMO[t.topEmo].name}」· 心情 ${t.avg.toFixed(1)}</div></div>`).join('') : '<p class="muted small">多记录开心时刻，找到你的能量来源</p>'}</div>
    </div></div>`;

  html += `<div class="card"><h3>🗓️ 情绪时间地图 <span class="sub">星期 × 时段</span></h3>${heatmap(list)}</div>`;

  html += `<div class="card"><h3>💡 发现</h3><ul class="insight-list">${findings(list, trig).map(f => `<li><span class="i">${f[0]}</span><span>${f[1]}</span></li>`).join('')}</ul></div>`;

  html += `<div class="card report-box"><h3>📮 小晴的${n === 7 ? '周' : '月'}报</h3><div id="report" class="ai-text muted">点击生成一份专属于你的情绪报告，包括回顾、规律和下阶段的小建议。</div>
    <button class="btn btn-primary btn-block" id="btn-report" style="margin-top:12px">✨ 生成${n === 7 ? '周' : '月'}报</button></div>`;
  return html;
}

function triggerStats(list) {
  const m = {};
  list.forEach(e => e.triggers.forEach(t => { (m[t] = m[t] || []).push(e); }));
  return Object.entries(m).filter(([, a]) => a.length >= 2).map(([name, a]) => {
    const ec = {}; a.forEach(e => ec[e.emotion] = (ec[e.emotion] || 0) + 1);
    return { name, n: a.length, avg: avg(a.map(score)), topEmo: Object.entries(ec).sort((x, y) => y[1] - x[1])[0][0] };
  });
}

function trendChart(n, list) {
  const days = daysInRange(n);
  const W = 340, H = 170, L = 26, R = 8, T = 10, B = 26;
  const byDay = {}; list.forEach(e => (byDay[ymd(e.ts)] = byDay[ymd(e.ts)] || []).push(e));
  const x = i => L + (W - L - R) * (days.length === 1 ? .5 : i / (days.length - 1));
  const y = v => T + (H - T - B) * (1 - v / 10);
  const pts = days.map((d, i) => byDay[d] ? { i, v: avg(byDay[d].map(score)), e: domEmo(byDay[d]) } : null).filter(Boolean);
  let path = '', area = '';
  if (pts.length) {
    path = pts.map((p, k) => {
      if (!k) return `M${x(p.i)},${y(p.v)}`;
      const q = pts[k - 1], cx = (x(q.i) + x(p.i)) / 2;
      return `C${cx},${y(q.v)} ${cx},${y(p.v)} ${x(p.i)},${y(p.v)}`;
    }).join(' ');
    area = path + ` L${x(pts.at(-1).i)},${y(0)} L${x(pts[0].i)},${y(0)} Z`;
  }
  const grid = [0, 5, 10].map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#EDE3D5" stroke-dasharray="3 4"/><text x="${L - 6}" y="${y(v) + 4}" font-size="11" text-anchor="end">${v === 0 ? '😢' : v === 5 ? '😐' : '😊'}</text>`).join('');
  const step = n === 7 ? 1 : 5;
  const labels = days.map((d, i) => (i % step === 0 || i === days.length - 1) && !(n === 30 && i === days.length - 2) ? `<text x="${x(i)}" y="${H - 6}" font-size="10" fill="#A09080" text-anchor="middle">${n === 7 ? '周' + WEEK[new Date(d + 'T00:00').getDay()] : d.slice(5).replace('-', '/')}</text>` : '').join('');
  const dots = pts.map(p => `<circle cx="${x(p.i)}" cy="${y(p.v)}" r="${n === 7 ? 5 : 3.5}" fill="${EMO[p.e].color}" stroke="#fff" stroke-width="2"><title>${days[p.i]} · ${p.v.toFixed(1)} 分</title></circle>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E08A6D" stop-opacity=".25"/><stop offset="1" stop-color="#E08A6D" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path d="${area}" fill="url(#ga)"/><path d="${path}" fill="none" stroke="#E08A6D" stroke-width="2.5" stroke-linecap="round"/>${dots}${labels}</svg>`;
}
function domEmo(a) { const c = {}; a.forEach(e => c[e.emotion] = (c[e.emotion] || 0) + e.intensity); return Object.entries(c).sort((x, y) => y[1] - x[1])[0][0]; }

const SLOTS = [['早', h => h >= 5 && h < 11], ['午', h => h >= 11 && h < 17], ['晚', h => h >= 17 && h < 22], ['夜', h => h >= 22 || h < 5]];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
function heatColor(v) {
  if (v == null) return '#F4EEE6';
  const c = v < 5 ? [[124, 146, 200], [238, 230, 222]] : [[238, 230, 222], [240, 170, 120]];
  const t = v < 5 ? v / 5 : (v - 5) / 5;
  const [a, b] = c; return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',')})`;
}
function heatmap(list) {
  let html = `<div class="heat"><span></span>${WEEK_ORDER.map(d => `<span class="h">${WEEK[d]}</span>`).join('')}`;
  SLOTS.forEach(([name, fn]) => {
    html += `<span class="h">${name}</span>`;
    WEEK_ORDER.forEach(wd => {
      const a = list.filter(e => { const d = new Date(e.ts); return d.getDay() === wd && fn(d.getHours()); });
      const v = a.length ? avg(a.map(score)) : null;
      html += `<span class="c" style="background:${heatColor(v)}" title="${v == null ? '无记录' : v.toFixed(1) + ' 分'}">${v == null ? '' : v.toFixed(0)}</span>`;
    });
  });
  return html + `</div><div class="legend"><i style="background:${heatColor(1)}"></i>低落 <i style="background:${heatColor(5)}"></i>平稳 <i style="background:${heatColor(9)}"></i>愉悦</div>`;
}

function findings(list, trig) {
  const out = [];
  const drain = trig.filter(t => t.avg < 5).sort((a, b) => a.avg - b.avg)[0];
  const fuel = trig.filter(t => t.avg >= 5.5).sort((a, b) => b.avg - a.avg)[0];
  if (drain) {
    const withIt = list.filter(e => e.triggers.includes(drain.name));
    const neg = withIt.filter(e => EMO[e.emotion].v < 0).length / withIt.length;
    out.push(['🌧️', `当「${drain.name}」出现时，你有 <b>${Math.round(neg * 100)}%</b> 的时候感到负面情绪，其中最常见的是「${EMO[drain.topEmo].name}」。`]);
  }
  if (fuel) out.push(['☀️', `「${fuel.name}」是你的能量来源，相关记录的平均心情达到 <b>${fuel.avg.toFixed(1)}</b> 分。低落时可以主动安排一些。`]);
  const wd = {}; list.forEach(e => (wd[new Date(e.ts).getDay()] = wd[new Date(e.ts).getDay()] || []).push(score(e)));
  const wds = Object.entries(wd).filter(([, a]) => a.length >= 2).map(([d, a]) => [d, avg(a)]).sort((a, b) => a[1] - b[1]);
  if (wds.length >= 3) out.push(['📅', `周${WEEK[wds[0][0]]}是你心情最低的一天（${wds[0][1].toFixed(1)} 分），周${WEEK[wds.at(-1)[0]]}最好（${wds.at(-1)[1].toFixed(1)} 分）。可以给周${WEEK[wds[0][0]]}提前准备一点小奖励。`]);
  const night = list.filter(e => { const h = new Date(e.ts).getHours(); return h >= 22 || h < 5; });
  if (night.length >= 3 && avg(night.map(score)) < avg(list.map(score)) - 0.5) out.push(['🌙', `深夜的记录心情明显偏低（${avg(night.map(score)).toFixed(1)} 分）。夜晚容易放大情绪，试试睡前的白噪音或身体扫描。`]);
  if (state.range === 30) {
    const mid = Date.now() - 15 * 864e5;
    const a = list.filter(e => e.ts < mid), b = list.filter(e => e.ts >= mid);
    if (a.length >= 3 && b.length >= 3) {
      const diff = avg(b.map(score)) - avg(a.map(score));
      if (Math.abs(diff) > 0.3) out.push([diff > 0 ? '📈' : '📉', `近 15 天的平均心情比前 15 天${diff > 0 ? '提升' : '下降'}了 <b>${Math.abs(diff).toFixed(1)}</b> 分。${diff > 0 ? '你的努力正在起作用！' : '最近可能遇到了一些事，记得对自己温柔一点。'}`]);
    }
  }
  const eff = Object.entries(toolEffectiveness()).filter(([, v]) => v.n >= 2).sort((a, b) => b[1].score - a[1].score)[0];
  if (eff) out.push(['🧘', `对你最有效的疗愈方式是「${TOOL[eff[0]].name}」，练习后 ${Math.round(eff[1].sum / (eff[1].n * 2) * 100)}% 的感受是“好多了”。`]);
  if (!out.length) out.push(['🌱', '继续记录，更多规律会慢慢浮现。']);
  return out;
}

function localReport(list) {
  const n = state.range, trig = triggerStats(list);
  const a = avg(list.map(score));
  const cnt = {}; list.forEach(e => cnt[e.emotion] = (cnt[e.emotion] || 0) + 1);
  const tops = Object.entries(cnt).sort((x, y) => y[1] - x[1]).slice(0, 2).map(([k]) => EMO[k].name);
  const drain = trig.filter(t => t.avg < 5).sort((x, y) => x.avg - y.avg)[0];
  const fuel = trig.filter(t => t.avg >= 5.5).sort((x, y) => y.avg - x.avg)[0];
  const care = state.care.filter(c => c.ts > Date.now() - n * 864e5).length;
  let s = `亲爱的你：\n\n过去 ${n} 天，你一共记录了 ${list.length} 次情绪，平均心情 ${a.toFixed(1)} 分。出现最多的是「${tops.join('」和「')}」。`;
  s += a >= 6 ? '整体来说，这是一段不错的时光 🌤️' : a >= 4.5 ? '有起有落，这就是真实的生活。' : '看得出来，这段时间你承受了不少，辛苦了 🤍';
  if (drain) s += `\n\n「${drain.name}」是最近最消耗你的因素。下次它再出现时，可以先停下来做 3 次深呼吸，再问问自己：这件事里，哪一部分是我能控制的？`;
  if (fuel) s += `\n\n而「${fuel.name}」总能让你好起来，请把它当作你的“情绪急救包”。`;
  s += `\n\n${care ? `这段时间你完成了 ${care} 次疗愈练习，你在认真照顾自己，这很了不起。` : '下个阶段，不妨试试每天花 3 分钟做一次疗愈练习。'}`;
  s += `\n\n下阶段的小目标：${drain ? `为「${drain.name}」准备一个应对仪式；` : ''}${fuel ? `每周至少安排两次「${fuel.name}」；` : ''}继续每天记录一次心情。\n\n—— 一直陪着你的小晴 🌱`;
  return s;
}

// ======================= 渲染：疗愈 =======================
function renderCare() {
  const cats = ['全部', '呼吸', '冥想', '运动', '声音', '音乐', '书写'];
  const mood = state.careMood;
  let html = `<div class="hello"><h1>疗愈工具箱</h1><p>几分钟的自我照顾，让情绪有处安放</p></div>
  <div class="card"><h3>此刻的心情是？</h3><div class="mood-pick">${EMOTIONS.map(e => `<button data-mood="${e.id}" class="${mood === e.id ? 'sel' : ''}">${e.emoji} ${e.name}</button>`).join('')}</div>
  ${mood ? `<p class="muted small" style="margin:12px 0 8px">为「${EMO[mood].name}」的你推荐：</p><div class="rec-row">${recommendTools(mood, 4).map(toolCard).join('')}</div>` : '<p class="muted small" style="margin:8px 0 0">选择心情，获得个性化推荐（会参考你过往练习的反馈）</p>'}</div>`;

  const eff = Object.entries(toolEffectiveness()).filter(([, v]) => v.n >= 1).sort((a, b) => b[1].score - a[1].score).slice(0, 3);
  if (eff.length) html += `<div class="card"><h3>💚 对你最有效</h3>${eff.map(([id, v]) => `<div class="bar-row" style="grid-template-columns:110px 1fr 50px"><span>${TOOL[id].icon} ${TOOL[id].name}</span><span class="track"><i style="width:${v.score / 2 * 100}%;background:var(--sage)"></i></span><span class="v">${v.n} 次</span></div>`).join('')}</div>`;

  html += `<div class="cat-tabs">${cats.map(c => `<button data-cat="${c}" class="${state.careCat === c ? 'sel' : ''}">${c}</button>`).join('')}</div>
  <div class="tool-list">${TOOLS.filter(t => state.careCat === '全部' || t.cat === state.careCat).map(t => toolCard(t.id)).join('')}</div>
  <div class="note" style="margin-top:16px">💡 这些练习适合日常情绪调节。如果持续两周以上情绪低落、失眠或影响生活，请寻求专业心理咨询。<br>全国心理援助热线：<b>12356</b> · 希望24热线：<b>400-161-9995</b></div>`;
  return html;
}

// ======================= 路由 =======================
function render() {
  const v = $('#view');
  v.innerHTML = { home: renderHome, diary: renderDiary, insight: renderInsight, care: renderCare }[state.tab]();
  document.querySelectorAll('.tabbar [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === state.tab));
}
function go(tab) { state.tab = tab; render(); window.scrollTo(0, 0); }

document.querySelectorAll('.tabbar [data-tab]').forEach(b => b.addEventListener('click', () => go(b.dataset.tab)));
$('#btn-add').addEventListener('click', () => openRecord());
$('#btn-settings').addEventListener('click', openSettings);

$('#view').addEventListener('click', async e => {
  const t = e.target.closest('[data-quick],[data-tool],[data-entry],[data-go],[data-range],[data-mood],[data-cat],#btn-demo,#btn-report,[data-del]');
  if (!t) return;
  if (t.dataset.quick) return openRecord(t.dataset.quick);
  if (t.dataset.tool) return openTool(t.dataset.tool);
  if (t.dataset.go) return go(t.dataset.go);
  if (t.dataset.range) { state.range = +t.dataset.range; return render(); }
  if (t.dataset.mood) { state.careMood = state.careMood === t.dataset.mood ? null : t.dataset.mood; return render(); }
  if (t.dataset.cat) { state.careCat = t.dataset.cat; return render(); }
  if (t.dataset.del) {
    e.stopPropagation();
    if (confirm('确定删除这条记录吗？')) { state.entries = state.entries.filter(x => x.id !== t.dataset.del); persist(); render(); toast('已删除'); }
    return;
  }
  if (t.dataset.entry) { t.classList.toggle('open'); const d = t.querySelector('.del'); if (d) d.style.display = t.classList.contains('open') ? 'block' : 'none'; return; }
  if (t.id === 'btn-demo') { loadDemo(); return; }
  if (t.id === 'btn-report') {
    const box = $('#report'), list = entriesIn(state.range);
    t.disabled = true; t.textContent = '小晴正在认真阅读你的日记…';
    box.classList.remove('muted'); box.textContent = ''; box.classList.add('typing');
    let text, src = 'local';
    try {
      const trig = triggerStats(list);
      const summary = `时间范围：最近 ${state.range} 天\n记录 ${list.length} 次，平均心情 ${avg(list.map(score)).toFixed(1)}/10\n情绪分布：${EMOTIONS.map(x => [x.name, list.filter(y => y.emotion === x.id).length]).filter(x => x[1]).map(x => x.join(' ')).join('，')}\n触发因素（名称/次数/平均心情）：${trig.map(x => `${x.name}/${x.n}/${x.avg.toFixed(1)}`).join('，')}\n部分日记：${list.filter(x => x.text).slice(-8).map(x => `[${EMO[x.emotion].name}] ${x.text}`).join(' | ')}`;
      text = await callLLM('你是「心晴」App 的情绪陪伴者小晴。根据用户的情绪数据写一封 250 字左右的中文信，包括：回顾与共情、发现的规律（引用具体数据）、2~3 个具体可执行的建议。温暖真诚，不诊断，结尾署名“小晴 🌱”。', summary);
      src = 'ai';
    } catch { text = localReport(list); }
    box.classList.remove('typing');
    await typeOut(box, text);
    t.disabled = false; t.textContent = '🔄 重新生成';
    box.insertAdjacentHTML('afterend', `<div class="muted small" style="margin-top:6px">${src === 'ai' ? '由大模型生成' : '由本地分析引擎生成 · 可在设置中接入大模型'}</div>`);
  }
});

async function typeOut(el, text) {
  el.classList.add('typing'); el.textContent = '';
  const step = Math.max(1, Math.round(text.length / 120));
  for (let i = 0; i < text.length; i += step) { el.textContent = text.slice(0, i + step); await new Promise(r => setTimeout(r, 16)); }
  el.classList.remove('typing');
}

// ======================= 记录流程 =======================
let draft = null;
function openRecord(emotion) {
  draft = { step: emotion ? 2 : 1, emotion: emotion || null, intensity: 3, triggers: [], text: '' };
  renderRecord(); openSheet('#record-mask');
}
function renderRecord() {
  const s = $('#record-sheet'), d = draft;
  const steps = `<div class="steps">${[1, 2, 3].map(i => `<i class="${d.step >= i ? 'on' : ''}"></i>`).join('')}</div>`;
  const head = t => `<div class="grab"></div><div class="sheet-head"><h2>${t}</h2><button class="close" data-x>✕</button></div>${steps}`;
  if (d.step === 1 || d.step === 2 && !d.emotion) {
    s.innerHTML = head('此刻的心情') + `
      <div class="step-q">选一个最贴近的情绪</div>
      <div class="emo-grid">${EMOTIONS.map(e => `<button data-emo="${e.id}" class="${d.emotion === e.id ? 'sel' : ''}"><span class="e">${e.emoji}</span>${e.name}</button>`).join('')}</div>
      ${d.emotion ? intensityBlock() : ''}
      <div class="sheet-actions"><button class="btn btn-primary" data-next ${d.emotion ? '' : 'disabled'}>下一步</button></div>`;
  } else if (d.step === 2) {
    const e = EMO[d.emotion];
    s.innerHTML = head(`${e.emoji} ${e.name}`) + `
      ${intensityBlock()}
      <div class="step-q" style="margin-top:18px">是什么引起了这份情绪？<span class="muted small" style="font-weight:400">（可多选）</span></div>
      ${TRIGGER_GROUPS.map(g => `<div class="tag-group">${g.name}</div><div class="tag-grid">${g.items.map(t => `<button data-trig="${t}" class="${d.triggers.includes(t) ? 'sel' : ''}">${TRIG_EMOJI[t]} ${t}</button>`).join('')}</div>`).join('')}
      <div class="sheet-actions"><button class="btn btn-ghost" data-save>直接保存</button><button class="btn btn-primary" data-next>写几句 ›</button></div>`;
  } else if (d.step === 3) {
    s.innerHTML = head('想说点什么吗？') + `
      <textarea class="journal" id="journal" placeholder="可以写写发生了什么、脑海里的想法……不写也没关系，这里只有你自己能看到。">${esc(d.text)}</textarea>
      <div class="prompts">${JOURNAL_PROMPTS.map(p => `<button data-prompt="${esc(p)}">${p}</button>`).join('')}</div>
      <div class="sheet-actions"><button class="btn btn-ghost" data-back>上一步</button><button class="btn btn-primary" data-save>保存并获得回应</button></div>`;
    setTimeout(() => $('#journal')?.focus(), 250);
  }
}
function intensityBlock() {
  const lbl = ['', '一点点', '有一些', '比较明显', '很强烈', '非常强烈'];
  return `<div class="slider-wrap"><div class="lbl"><span>强度</span><b id="int-lbl">${lbl[draft.intensity]}</b></div>
    <input type="range" min="1" max="5" step="1" value="${draft.intensity}" id="int">
    <div class="scale-txt"><span>轻微</span><span>强烈</span></div></div>`;
}

$('#record-sheet').addEventListener('input', e => {
  if (e.target.id === 'int') { draft.intensity = +e.target.value; $('#int-lbl').textContent = ['', '一点点', '有一些', '比较明显', '很强烈', '非常强烈'][draft.intensity]; }
  if (e.target.id === 'journal') draft.text = e.target.value;
});
$('#record-sheet').addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.hasAttribute('data-x')) return closeSheet('#record-mask');
  if (t.dataset.emo) { draft.emotion = t.dataset.emo; return renderRecord(); }
  if (t.dataset.trig) { const i = draft.triggers.indexOf(t.dataset.trig); i >= 0 ? draft.triggers.splice(i, 1) : draft.triggers.push(t.dataset.trig); t.classList.toggle('sel'); return; }
  if (t.hasAttribute('data-next')) { draft.step++; return renderRecord(); }
  if (t.hasAttribute('data-back')) { draft.step--; return renderRecord(); }
  if (t.dataset.prompt) { const j = $('#journal'); j.value += (j.value && !j.value.endsWith('\n') ? '\n' : '') + t.dataset.prompt; draft.text = j.value; j.focus(); return; }
  if (t.hasAttribute('data-save')) return saveEntry();
});

async function saveEntry() {
  const d = draft;
  const entry = { id: uid(), ts: Date.now(), emotion: d.emotion, intensity: d.intensity, triggers: d.triggers.slice(), text: d.text.trim() };
  const crisis = CRISIS_RE.test(entry.text);
  const dist = detectDistortions(entry.text);
  const recs = recommendTools(entry.emotion, 3);
  const before = treeInfo().lv;

  const s = $('#record-sheet');
  s.innerHTML = `<div class="grab"></div><div class="sheet-head"><h2>已记录 ${EMO[entry.emotion].emoji}</h2><button class="close" data-x>✕</button></div>
    ${crisis ? crisisCard() : ''}
    <div class="ai-reply"><div class="ai-head"><span class="avatar">🌱</span>小晴<span class="src muted" id="src"></span></div><div class="ai-text typing" id="reply"></div>
    ${dist.length ? dist.map(x => `<div class="distortion">🔎 注意到可能有 <b>「${x.name}」</b> 的想法<br>${x.tip}</div>`).join('') : ''}</div>
    <div class="section-title" style="margin-top:6px">🌿 现在可以试试</div>
    <div class="rec-row">${recs.map(toolCard).join('')}</div>
    <div class="sheet-actions"><button class="btn btn-soft" data-x>完成</button></div>`;

  let reply;
  if (crisis) reply = { text: '谢谢你愿意把这么沉重的感受说出来，这需要很大的勇气。你现在的痛苦是真实的，你值得被帮助，也不必一个人扛着。\n\n请现在就联系上面的专业热线，或者告诉一个你信任的人。我会一直在这里。', src: 'local' };
  else reply = await genReply(entry);
  entry.reply = { text: reply.text, src: reply.src };
  state.entries.push(entry); persist();

  $('#src').textContent = reply.src === 'ai' ? 'AI 生成' : reply.err ? `本地回应（大模型调用失败：${reply.err}）` : '本地回应';
  await typeOut($('#reply'), reply.text);
  if (treeInfo().lv > before) toast(`🎉 你的情绪小树升级啦：${treeInfo().name}`);
  render();
}
$('#record-sheet').addEventListener('click', e => { if (e.target.closest('[data-tool]')) { closeSheet('#record-mask'); openTool(e.target.closest('[data-tool]').dataset.tool); } });

function crisisCard() {
  return `<div class="crisis"><h4>🤝 你并不孤单</h4>如果你正经历非常痛苦的时刻，请立刻联系专业的人：<br>
    · 全国心理援助热线 <a href="tel:12356">12356</a><br>· 希望24热线 <a href="tel:4001619995">400-161-9995</a>（24 小时）<br>· 紧急情况请拨打 <a href="tel:110">110</a> / <a href="tel:120">120</a></div>`;
}

// ======================= 疗愈播放器 =======================
let timer = null, audio = null;
function stopPlayer() {
  clearInterval(timer); clearTimeout(timer); timer = null;
  if (audio) { try { audio.ctx.close(); } catch {} audio = null; }
}
function closePlayer() { stopPlayer(); closeSheet('#player-mask'); }

function openTool(id) {
  const t = TOOL[id], p = $('#player');
  stopPlayer();
  const head = `<div class="grab"></div><div class="sheet-head"><h2>${t.icon} ${t.name}</h2><button class="close" data-px>✕</button></div>`;
  if (t.type === 'breath' || t.type === 'steps') {
    p.innerHTML = head + `<div class="stage">
      <div class="orb-wrap"><div class="ring"></div><div class="orb ${t.type === 'steps' ? 'sage pulse' : ''}" id="orb">${t.type === 'breath' ? '' : ''}</div></div>
      <div class="phase" id="phase">${t.desc}</div>
      <div class="guide-text" id="guide">${t.type === 'breath' ? `共 ${t.cycles} 轮，跟着圆圈的节奏呼吸。<br>${t.phases.map(x => `${x.t} ${x.s} 秒`).join(' → ')}` : '找一个安静的角落，准备好了就开始吧。'}</div>
      <div class="count" id="count"></div></div>
      <div class="bar"><i id="bar" style="width:0"></i></div>
      <button class="btn btn-primary btn-block" id="p-start">开始练习</button>`;
    $('#p-start').onclick = () => { $('#p-start').style.display = 'none'; t.type === 'breath' ? runBreath(t) : runSteps(t); };
  } else if (t.type === 'sound') {
    p.innerHTML = head + `<div class="stage"><div class="orb-wrap"><div class="ring"></div><div class="orb sage pulse" id="orb">🎧</div></div>
      <div class="phase" id="phase">选择一种声音</div>
      <div class="sound-grid">${[['rain', '🌧️', '雨声'], ['ocean', '🌊', '海浪'], ['wind', '🍃', '微风'], ['pink', '☁️', '粉红噪音']].map(([k, e, n]) => `<button data-snd="${k}"><span class="e">${e}</span>${n}</button>`).join('')}</div>
      <label class="vol">音量<input type="range" id="vol" min="0" max="1" step=".05" value=".6"></label></div>
      <button class="btn btn-soft btn-block" id="p-done" style="margin-top:12px">听好了，结束</button>`;
    p.querySelectorAll('[data-snd]').forEach(b => b.onclick = () => {
      p.querySelectorAll('[data-snd]').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
      playSound(b.dataset.snd); $('#phase').textContent = '闭上眼睛，放松地听一会儿…';
    });
    $('#vol').oninput = e => { if (audio) audio.gain.gain.value = +e.target.value; };
    $('#p-done').onclick = () => finishTool(t);
  } else if (t.type === 'music') {
    const mood = state.careMood || state.entries.slice().sort((a, b) => b.ts - a.ts)[0]?.emotion;
    const order = Object.entries(PLAYLISTS).sort(([, a], [, b]) => (b.for.includes(mood) ? 1 : 0) - (a.for.includes(mood) ? 1 : 0));
    p.innerHTML = head + `<p class="muted small">${mood ? `根据你「${EMO[mood].name}」的心情，优先推荐：` : '选一份适合此刻的歌单：'}</p>` +
      order.map(([, pl], i) => `<div class="card" style="${i === 0 ? 'border:2px solid var(--accent-soft)' : ''}"><h3>${i === 0 && mood ? '⭐ ' : ''}${pl.name}</h3>${pl.songs.map(([n, a]) => `<div class="song"><span>🎵</span><div><div class="n">${n}</div><div class="a">${a}</div></div><a href="https://music.163.com/#/search/m/?s=${encodeURIComponent(n + ' ' + a)}" target="_blank" rel="noopener">去听 ›</a></div>`).join('')}</div>`).join('') +
      `<button class="btn btn-soft btn-block" id="p-done">听完了</button>`;
    $('#p-done').onclick = () => finishTool(t);
  } else if (t.type === 'gratitude') {
    p.innerHTML = head + `<p class="muted">写下今天发生的三件好事，再小都可以。研究发现，坚持一周就能提升幸福感。</p>
      ${[1, 2, 3].map(i => `<div class="field"><label>第 ${i} 件好事</label><input class="g-in" placeholder="${['比如：早餐的豆浆很好喝', '比如：同事帮我带了咖啡', '比如：下班路上看到了晚霞'][i - 1]}"></div>`).join('')}
      <button class="btn btn-primary btn-block" id="p-done">写好了 ✨</button>`;
    $('#p-done').onclick = () => {
      const items = [...p.querySelectorAll('.g-in')].map(i => i.value.trim()).filter(Boolean);
      if (!items.length) return toast('至少写一件吧～');
      const g = load(LS.grat, []); g.push({ ts: Date.now(), items }); save(LS.grat, g);
      finishTool(t);
    };
  }
  p.querySelector('[data-px]').onclick = closePlayer;
  openSheet('#player-mask');
}

function runBreath(t) {
  const orb = $('#orb'), phase = $('#phase'), cnt = $('#count'), bar = $('#bar'), guide = $('#guide');
  const seq = []; for (let c = 0; c < t.cycles; c++) t.phases.forEach(p => seq.push({ ...p, c }));
  const total = seq.reduce((a, b) => a + b.s, 0); let elapsed = 0, i = 0;
  guide.textContent = '';
  const next = () => {
    if (i >= seq.length) return finishTool(t);
    const p = seq[i++]; let left = p.s;
    orb.style.transitionDuration = p.s + 's'; orb.style.transform = `scale(${p.sc})`;
    phase.textContent = p.t; orb.textContent = left; cnt.textContent = `第 ${p.c + 1} / ${t.cycles} 轮`;
    timer = setInterval(() => {
      left--; elapsed++; bar.style.width = elapsed / total * 100 + '%';
      if (left > 0) orb.textContent = left; else { clearInterval(timer); next(); }
    }, 1000);
  };
  next();
}
function runSteps(t) {
  const phase = $('#phase'), guide = $('#guide'), cnt = $('#count'), bar = $('#bar');
  const total = t.steps.reduce((a, b) => a + b.s, 0); let elapsed = 0, i = 0;
  phase.textContent = '';
  const next = () => {
    if (i >= t.steps.length) return finishTool(t);
    const st = t.steps[i++]; let left = st.s;
    guide.style.opacity = 0;
    setTimeout(() => { guide.innerHTML = esc(st.t).replace(/\n/g, '<br>'); guide.style.transition = 'opacity .6s'; guide.style.opacity = 1; }, 200);
    cnt.innerHTML = `第 ${i} / ${t.steps.length} 步 · ${left} 秒 <button class="small" style="color:var(--accent-deep);margin-left:6px" id="skip">下一步 ›</button>`;
    timer = setInterval(() => {
      left--; elapsed++; bar.style.width = elapsed / total * 100 + '%';
      cnt.firstChild.textContent = `第 ${i} / ${t.steps.length} 步 · ${left} 秒 `;
      if (left <= 0) { clearInterval(timer); next(); }
    }, 1000);
    cnt.querySelector('#skip').onclick = () => { clearInterval(timer); elapsed += left; next(); };
  };
  next();
}

function finishTool(t) {
  stopPlayer();
  const before = treeInfo().lv;
  const rec = { id: uid(), ts: Date.now(), tool: t.id, fb: null };
  state.care.push(rec); persist();
  const p = $('#player');
  p.innerHTML = `<div class="grab"></div><div class="sheet-head"><h2></h2><button class="close" data-px>✕</button></div>
    <div class="stage"><div class="done-big">🌱</div><h2 style="margin:10px 0 4px">完成了「${t.name}」</h2>
    <p class="muted">你刚刚花时间照顾了自己，小树 +1 成长值</p>
    <p style="margin-top:24px;font-weight:600">现在感觉怎么样？</p>
    <div class="feedback"><button data-fb="better">😊 好多了</button><button data-fb="bit">🙂 好一点</button><button data-fb="same">😐 没变化</button></div>
    <p class="muted small" style="margin-top:14px">你的反馈会让推荐越来越懂你</p></div>`;
  p.querySelector('[data-px]').onclick = closePlayer;
  p.querySelectorAll('[data-fb]').forEach(b => b.onclick = () => {
    rec.fb = b.dataset.fb; persist(); closePlayer(); render();
    toast(treeInfo().lv > before ? `🎉 小树升级啦：${treeInfo().name}` : '已记录，谢谢你的反馈 🌿');
  });
  render();
}

// Web Audio 合成自然声音（无需外部音频文件）
function playSound(kind) {
  if (audio) { try { audio.ctx.close(); } catch {} }
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === 'ocean' || kind === 'wind') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    else { b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852; b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926; }
  }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const gain = ctx.createGain(); gain.gain.value = +($('#vol')?.value ?? .6);
  const shape = ctx.createGain(); shape.gain.value = 1;
  let node = src;
  if (kind === 'rain') { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 500; node.connect(f); node = f; }
  if (kind === 'wind') {
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = .8;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .12; lg.gain.value = 300; lfo.connect(lg).connect(f.frequency); lfo.start();
    node.connect(f); node = f;
  }
  if (kind === 'ocean') {
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .09; lg.gain.value = .45; shape.gain.value = .55;
    lfo.connect(lg).connect(shape.gain); lfo.start();
  }
  node.connect(shape).connect(gain).connect(ctx.destination); src.start();
  audio = { ctx, gain };
}

// ======================= 设置 =======================
function openSettings() {
  const c = aiCfg();
  $('#settings').innerHTML = `<div class="grab"></div><div class="sheet-head"><h2>设置</h2><button class="close" data-sx>✕</button></div>
    <div class="card"><h3>🤖 AI 陪伴引擎</h3>
      <div class="field"><label>模型服务</label><select id="s-provider">
        <option value="none">本地智能引擎（免费，无需配置）</option>
        <option value="deepseek">DeepSeek</option>
        <option value="openai">OpenAI 兼容接口（通义/Kimi/智谱等）</option>
        <option value="claude">Anthropic Claude</option></select></div>
      <div id="s-extra">
        <div class="field"><label>API Key</label><input id="s-key" type="password" placeholder="sk-..." value="${esc(c.key)}"></div>
        <div class="field" id="s-base-f"><label>接口地址（可选）</label><input id="s-base" placeholder="https://api.openai.com/v1" value="${esc(c.base)}"></div>
        <div class="field"><label>模型名（可选）</label><input id="s-model" placeholder="留空使用默认模型" value="${esc(c.model)}"></div>
      </div>
      <div class="note">🔒 API Key 只保存在你当前浏览器的本地，由浏览器直接请求模型服务商，不会经过任何第三方服务器。如果调用失败，会自动回退到本地引擎。</div>
      <button class="btn btn-primary btn-block" id="s-save" style="margin-top:12px">保存</button>
    </div>
    <div class="card"><h3>🗂️ 数据</h3>
      <p class="muted small" style="margin-top:0">所有日记都只保存在你的设备上，没有账号、没有云端，保护你的隐私。</p>
      <div class="row"><button class="btn btn-soft grow" id="s-demo">载入示例数据</button><button class="btn btn-ghost grow" id="s-clear">清空所有数据</button></div>
    </div>
    <div class="card"><h3>🌱 关于心晴</h3><p class="small muted" style="margin:0">心晴是一款低门槛的情绪日记与自我关怀工具：<b>10 秒记录 → 看见触发因素 → 获得即时调节方案</b>。它不能替代专业心理咨询，若情绪困扰持续，请及时寻求专业帮助（全国心理援助热线 12356）。</p></div>`;
  const sel = $('#s-provider'); sel.value = c.provider;
  const sync = () => { $('#s-extra').style.display = sel.value === 'none' ? 'none' : ''; $('#s-base-f').style.display = sel.value === 'openai' ? '' : 'none'; };
  sel.onchange = sync; sync();
  $('[data-sx]').onclick = () => closeSheet('#settings-mask');
  $('#s-save').onclick = () => {
    save(LS.ai, { provider: sel.value, key: $('#s-key').value.trim(), base: $('#s-base').value.trim(), model: $('#s-model').value.trim() });
    closeSheet('#settings-mask'); toast(sel.value === 'none' ? '已切换为本地引擎' : '已保存，下次记录将由大模型回应');
  };
  $('#s-demo').onclick = () => { closeSheet('#settings-mask'); loadDemo(); };
  $('#s-clear').onclick = () => {
    if (!confirm('确定清空所有日记和练习记录吗？此操作无法撤销。')) return;
    state.entries = []; state.care = []; persist(); save(LS.grat, []); closeSheet('#settings-mask'); go('home'); toast('已清空');
  };
  openSheet('#settings-mask');
}

// ======================= 示例数据 =======================
function loadDemo() {
  if (state.entries.length && !confirm('载入示例数据会覆盖当前记录，确定吗？')) return;
  const TXT = {
    anxious: [['工作', '周一例会又被点名要进度，方案还没做完，心一直揪着。'], ['工作', '领导说这个项目周五必须上线，我总是担心自己搞砸。'], ['学业', '考试周要来了，复习进度才一半，感觉肯定会完蛋。'], ['未来', '刷到同龄人都升职了，我是不是落后太多了。'], ['金钱', '这个月房租和信用卡一起到期，有点慌。']],
    tired: [['睡眠', '昨晚刷手机到两点，今天整个人都是木的。'], ['工作', '连续加班第三天，眼睛睁不开了。'], ['身体', '肩颈好痛，坐了一整天。'], ['学业', '图书馆泡了一天，脑子转不动了。']],
    sad: [['人际', '好像大家聚会都没叫我，有点失落。'], ['未来', '不知道自己到底想要什么，好迷茫。'], ['天气', '连下一周的雨，心情也跟着潮湿。'], ['家庭', '和妈妈打电话又被催，挂了电话很难过。']],
    angry: [['工作', '同事把锅甩给我，还在群里阴阳怪气。'], ['人际', '室友又半夜打游戏大声说话。'], ['工作', '需求改了第五遍，我真的会谢。']],
    wronged: [['人际', '明明是我做的，汇报时却被别人说成是他的功劳。'], ['家庭', '爸妈总觉得我不够努力，可我已经很努力了。'], ['恋爱', '他又忘了我们约好的事，还说我太敏感。']],
    happy: [['朋友', '和老朋友吃了火锅，笑到肚子痛！'], ['运动', '跑完 5 公里，出了一身汗，整个人都通透了。'], ['美食', '发现楼下新开了一家超好吃的面馆。'], ['爱好', '周末画完了一幅画，好有成就感。'], ['自然', '去公园散步，看到了超美的晚霞。']],
    calm: [['独处', '一个人在咖啡馆看了一下午书，很平静。'], ['自然', '早起在阳台晒太阳，听着鸟叫。'], ['运动', '做了半小时瑜伽，心慢慢静下来了。']],
    grateful: [['朋友', '失落的时候朋友专门打电话来陪我聊天。'], ['家庭', '妈妈寄来了自己做的腊肠，好想家。'], ['工作', '导师夸我这次报告做得很扎实。']],
  };
  const entries = [], care = [], now = new Date();
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  for (let back = 29; back >= 0; back--) {
    const day = new Date(now); day.setDate(now.getDate() - back);
    const wd = day.getDay(), weekend = wd === 0 || wd === 6;
    if (Math.random() < .1 && back > 0) continue;
    const k = back === 0 ? 1 : rnd(1, 3);
    const improve = back < 12 ? .15 : 0; // 最近情绪逐渐变好（配合疗愈练习）
    for (let j = 0; j < k; j++) {
      const hour = [rnd(8, 10), rnd(12, 16), rnd(19, 21), rnd(22, 23)][Math.min(3, j + (Math.random() < .25 ? 1 : 0))];
      let emo;
      const r = Math.random() - improve;
      if (weekend) emo = r < .55 ? pick(['happy', 'calm', 'grateful']) : r < .75 ? 'calm' : pick(['tired', 'sad']);
      else if (wd === 1) emo = r < .5 ? 'anxious' : r < .7 ? 'tired' : r < .85 ? pick(['angry', 'wronged']) : 'calm';
      else emo = r < .25 ? 'anxious' : r < .42 ? 'tired' : r < .52 ? pick(['angry', 'wronged', 'sad']) : pick(['happy', 'calm', 'grateful']);
      if (hour >= 22 && Math.random() < .5) emo = pick(['sad', 'anxious', 'tired']);
      const [trig, text] = pick(TXT[emo]);
      const triggers = [trig];
      if (emo === 'tired' && trig !== '睡眠' && Math.random() < .5) triggers.push('睡眠');
      if (EMO[emo].v > 0 && Math.random() < .3) triggers.push(pick(['美食', '自然', '朋友']));
      const ts = new Date(day); ts.setHours(hour, rnd(0, 59), 0, 0);
      if (ts > now) ts.setTime(now.getTime() - rnd(10, 90) * 60000);
      const e = { id: uid(), ts: ts.getTime(), emotion: emo, intensity: rnd(2, 5), triggers: [...new Set(triggers)], text: Math.random() < .85 ? text : '' };
      e.reply = { text: localReply(e), src: 'local' };
      entries.push(e);
    }
    if (back < 18 && Math.random() < .55) {
      const tool = pick(['breath478', 'breath478', 'walk', 'sounds', 'compassion', 'stretch', 'bodyscan', 'grounding']);
      const fb = tool === 'breath478' || tool === 'walk' ? pick(['better', 'better', 'bit']) : pick(['better', 'bit', 'bit', 'same']);
      const ts = new Date(day); ts.setHours(rnd(12, 21), rnd(0, 59));
      if (ts < now) care.push({ id: uid(), ts: ts.getTime(), tool, fb });
    }
  }
  state.entries = entries; state.care = care; persist();
  toast(`已载入 ${entries.length} 条示例记录 ✨`);
  go(state.tab === 'insight' ? 'insight' : 'home');
}

render();
