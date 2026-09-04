export const GRID = { cols: 12, rows: 7, size: 64 };

export const OPERATORS = [
  { id:'amiya', name:'阿米娅', role:'术师', cost:18, atk:48, range:2.3, interval:1.05, target:'single', damage:'arts', skill:'精神爆发', skillText:'12秒内攻击力 +90%，攻击间隔缩短', skillMult:1.9, skillDuration:12, portrait:'assets/all-portraits/char_002_amiya.png', unlockLevel:1 },
  { id:'exusiai', name:'能天使', role:'狙击', cost:14, atk:26, range:3.2, interval:.34, target:'single', damage:'physical', skill:'过载模式', skillText:'10秒内每次攻击额外发射 2 枚子弹', skillMult:1, skillDuration:10, portrait:'assets/all-portraits/char_103_angel.png', unlockLevel:1 },
  { id:'hoshiguma', name:'星熊', role:'重装', cost:20, atk:34, range:1.15, interval:1.1, target:'single', damage:'physical', block:3, skill:'力之锯', skillText:'10秒内攻击力 +110%，同时攻击阻挡目标', skillMult:2.1, skillDuration:10, portrait:'assets/all-portraits/char_136_hsguma.png', unlockLevel:1 },
  { id:'shining', name:'闪灵', role:'医疗', cost:17, atk:42, range:2.35, interval:1.25, target:'heal', damage:'heal', skill:'自动掩护', skillText:'10秒内治疗量 +110%，为目标提供护盾', skillMult:2.1, skillDuration:10, portrait:'assets/all-portraits/char_147_shining.png', unlockLevel:3 },
  { id:'silverash', name:'银灰', role:'近卫', cost:19, atk:62, range:1.4, interval:.85, target:'single', damage:'physical', block:2, skill:'真银斩', skillText:'8秒内攻击范围扩大并攻击所有范围内敌人', skillMult:1.55, skillDuration:8, portrait:'assets/all-portraits/char_172_svrash.png', unlockLevel:5 },
  { id:'texas', name:'德克萨斯', role:'先锋', cost:11, atk:40, range:1.15, interval:.9, target:'single', damage:'physical', block:2, skill:'剑雨', skillText:'立即对周围敌人造成伤害，10秒内攻击力提升', skillMult:1.6, skillDuration:10, portrait:'assets/all-portraits/char_102_texas.png', unlockLevel:2 },
  { id:'lappland', name:'拉普兰德', role:'近卫', cost:17, atk:56, range:1.45, interval:.8, target:'single', damage:'arts', block:2, skill:'狼魂', skillText:'12秒内攻击变为法术伤害并提升攻击力', skillMult:1.7, skillDuration:12, portrait:'assets/all-portraits/char_140_whitew.png', unlockLevel:7 }
];

export const ENEMIES = {
  scout:{ name:'猎犬', hp:180, def:8, res:0, spd:1.25, atk:24, model:'hound', reward:6, color:'#eeb55c' },
  soldier:{ name:'士兵', hp:520, def:38, res:8, spd:.68, atk:55, model:'soldier', reward:9, color:'#b3c4d1' },
  caster:{ name:'术师', hp:430, def:18, res:32, spd:.58, atk:78, model:'caster', reward:11, color:'#bb83ff' },
  crusher:{ name:'重装防御者', hp:1560, def:110, res:18, spd:.33, atk:135, model:'crusher', reward:16, color:'#e56262' },
  drone:{ name:'无人机', hp:300, def:12, res:20, spd:1.08, atk:42, model:'drone', reward:10, color:'#54d7eb' },
  boss:{ name:'精英领袖', hp:4300, def:95, res:35, spd:.34, atk:190, model:'boss', reward:30, color:'#f0466f' }
};

export const MAPS = [
  { id:'canal', name:'荒野运河', trait:'双路汇合：近战干员在中央路口可有效阻挡敌军。', roadRows:[3,4], routes:[[[0,3.5],[4,3.5],[4,4.5],[12,4.5]],[[0,4.5],[12,4.5]]] },
  { id:'roof', name:'龙门屋顶', trait:'狭长通路：高台火力能覆盖长距离敌人。', roadRows:[4], routes:[[[0,4.5],[8,4.5],[8,2.5],[12,2.5]],[[0,4.5],[12,4.5]]] },
  { id:'cross', name:'废墟十字路', trait:'交叉路线：敌军会在中枢交汇，需要分配阻挡单位。', roadRows:[2,4], routes:[[[0,2.5],[6,2.5],[6,4.5],[12,4.5]],[[0,4.5],[6,4.5],[6,2.5],[12,2.5]]] },
  { id:'bend', name:'霜原弯道', trait:'连续弯道：术师与狙击可利用拐点覆盖。', roadRows:[3,4], routes:[[[0,3.5],[3,3.5],[3,5.5],[9,5.5],[9,4.5],[12,4.5]],[[0,4.5],[5,4.5],[5,2.5],[12,2.5]]] },
  { id:'fort', name:'边境要塞', trait:'三线推进：守住三处出口，医疗干员价值更高。', roadRows:[2,3,4], routes:[[[0,2.5],[12,2.5]],[[0,3.5],[7,3.5],[7,4.5],[12,4.5]],[[0,4.5],[12,4.5]]] }
];

const waveTypes = ['scout', 'soldier', 'caster', 'drone', 'crusher'];
export const LEVELS = Array.from({ length:50 }, (_, index) => {
  const id = index + 1;
  const map = MAPS[index % MAPS.length];
  const scale = 1 + (id - 1) * .095;
  const waves = [
    { type: id % 5 === 0 ? 'drone' : 'scout', count: 4 + Math.ceil(id / 4), gap: Math.max(430, 680 - id * 4), route:0 },
    { type: id > 3 ? 'soldier' : 'scout', count: 3 + Math.ceil(id / 3), gap: Math.max(600, 860 - id * 3), route:1 % map.routes.length },
    { type: id > 9 ? 'caster' : 'soldier', count: 2 + Math.floor(id / 5), gap: 980, route:2 % map.routes.length }
  ];
  if (id >= 14) waves.push({ type: waveTypes[(id + 3) % waveTypes.length], count: 1 + Math.floor(id / 14), gap: 1150, route:3 % map.routes.length });
  if (id % 5 === 0) waves.push({ type:'boss', count:1, gap:10, route:0 });
  // Every operation grants a roster reward. The first clear unlocks a new operator when applicable;
  // later repeats are represented as action badges by the progress layer.
  const reward = OPERATORS.find(operator => operator.unlockLevel === id)?.id ?? OPERATORS[(id - 1) % OPERATORS.length].id;
  return { id, name:`行动 ${String(id).padStart(2,'0')} · ${map.name}`, map, scale, waves, reward };
});
