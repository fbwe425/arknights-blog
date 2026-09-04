export const GRID={cols:12,rows:7,size:64};
export const OPERATORS=[
 {id:'amiya',name:'阿米娅',role:'术师',cost:18,atk:48,range:2.3,interval:1.05,target:'single',damage:'arts',skill:'精神爆发',skillText:'12秒内攻击力 +90%，攻击间隔缩短',skillMult:1.9,skillDuration:12,portrait:'assets/all-portraits/char_002_amiya.png'},
 {id:'exusiai',name:'能天使',role:'狙击',cost:14,atk:26,range:3.2,interval:.34,target:'single',damage:'physical',skill:'过载模式',skillText:'10秒内每次攻击额外发射 2 枚子弹',skillMult:1,skillDuration:10,portrait:'assets/all-portraits/char_103_angel.png'},
 {id:'hoshiguma',name:'星熊',role:'重装',cost:20,atk:34,range:1.15,interval:1.1,target:'single',damage:'physical',block:3,skill:'力之锯',skillText:'10秒内攻击力 +110%，同时攻击阻挡目标',skillMult:2.1,skillDuration:10,portrait:'assets/all-portraits/char_136_hsguma.png'},
 {id:'shining',name:'闪灵',role:'医疗',cost:17,atk:42,range:2.35,interval:1.25,target:'heal',damage:'heal',skill:'自动掩护',skillText:'10秒内治疗量 +110%，为目标提供护盾',skillMult:2.1,skillDuration:10,portrait:'assets/all-portraits/char_147_shining.png'},
 {id:'silverash',name:'银灰',role:'近卫',cost:19,atk:62,range:1.4,interval:.85,target:'single',damage:'physical',block:2,skill:'真银斩',skillText:'8秒内攻击范围扩大并攻击所有范围内敌人',skillMult:1.55,skillDuration:8,portrait:'assets/all-portraits/char_172_svrash.png'}
];
export const ENEMIES={
 scout:{name:'猎犬',hp:180,def:8,res:0,spd:1.25,atk:24,model:'hound',reward:6,color:'#eeb55c'},
 soldier:{name:'士兵',hp:520,def:38,res:8,spd:.68,atk:55,model:'soldier',reward:9,color:'#b3c4d1'},
 caster:{name:'术师',hp:430,def:18,res:32,spd:.58,atk:78,model:'caster',reward:11,color:'#bb83ff'},
 crusher:{name:'重装防御者',hp:1560,def:110,res:18,spd:.33,atk:135,model:'crusher',reward:16,color:'#e56262'},
 drone:{name:'无人机',hp:300,def:12,res:20,spd:1.08,atk:42,model:'drone',reward:10,color:'#54d7eb'},
 boss:{name:'精英领袖',hp:4300,def:95,res:35,spd:.34,atk:190,model:'boss',reward:30,color:'#f0466f'}
};
// 50 operations generated with increasing difficulty, three to five discrete waves each.
export const LEVELS=Array.from({length:50},(_,i)=>{const n=i+1,scale=1+(n-1)*.115;const waves=[
 {type:n%5===0?'drone':'scout',count:5+Math.floor(n/3),gap:620},
 {type:n>4?'soldier':'scout',count:4+Math.floor(n/2),gap:760},
 {type:n>10?'caster':'soldier',count:2+Math.floor(n/4),gap:930}
 ];if(n>=16)waves.push({type:n%3===0?'crusher':'drone',count:1+Math.floor(n/12),gap:1150});if(n%5===0)waves.push({type:'boss',count:1,gap:10});return {id:n,name:`行动 ${String(n).padStart(2,'0')} · ${n%5===0?'危机合约':'边境防线'}`,scale,waves,map:n%3};});
