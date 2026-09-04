import { GRID, OPERATORS, ENEMIES, LEVELS } from './game-data.js?v=map-progress-3';

const MAX_DP = 99;
const RANGED_ROLES = new Set(['狙击', '术师', '医疗']);

function distanceToUnit(enemy, unit) {
  return Math.hypot(enemy.x - (unit.col + 0.5), enemy.y - (unit.row + 0.5));
}

export class GameEngine {
  constructor() {
    this.listeners = {};
    this.reset(1);
  }

  on(eventName, callback) {
    (this.listeners[eventName] ??= []).push(callback);
  }

  emit(eventName, payload) {
    (this.listeners[eventName] || []).forEach(callback => callback(payload));
  }

  reset(levelId = 1) {
    this.level = LEVELS[levelId - 1];
    this.time = 0;
    this.dp = 22;
    this.life = 3;
    this.kills = 0;
    this.total = this.level.waves.reduce((sum, wave) => sum + wave.count, 0);
    this.enemies = [];
    this.units = [];
    this.bullets = [];
    this.wave = 0;
    this.spawned = 0;
    this.nextSpawn = 0;
    this.running = false;
    this.paused = false;
    this.over = false;
    this.selected = OPERATORS[0];
    this.speed = 1;
    this.emit('state', this);
  }

  start() {
    if (this.over) return;
    if (!this.running) {
      this.running = true;
      this.paused = false;
      this.emit('log', `行动开始：共 ${this.level.waves.length} 波敌军。`);
    }
  }

  togglePause() {
    if (!this.running || this.over) return;
    this.paused = !this.paused;
    this.emit('log', this.paused ? '行动已暂停。' : '行动继续。');
  }

  toggleSpeed() {
    this.speed = this.speed === 1 ? 2 : 1;
    this.emit('log', `作战速度：${this.speed} 倍。`);
  }

  select(id) {
    this.selected = OPERATORS.find(operator => operator.id === id) ?? null;
    this.emit('state', this);
  }

  isRoadTile(col, row) {
    return this.level.map.routes.some(route => route.some((point, index) => {
      if (!index) return false;
      const previous = route[index - 1];
      const horizontal = previous[1] === point[1] && row === Math.floor(point[1]);
      const vertical = previous[0] === point[0] && col === Math.floor(point[0]);
      return horizontal || vertical;
    }));
  }

  isValidTile(operator, col, row) {
    return RANGED_ROLES.has(operator.role) ? !this.isRoadTile(col, row) : this.isRoadTile(col, row);
  }

  deploy(col, row) {
    const operator = this.selected;
    if (!operator || this.dp < operator.cost || this.units.some(unit => unit.col === col && unit.row === row)) {
      this.emit('log', '无法在此部署。请确认费用和空位。');
      return false;
    }
    if (!this.isValidTile(operator, col, row)) {
      this.emit('log', RANGED_ROLES.has(operator.role) ? '远程干员只能部署在高台格。' : '近战干员只能部署在道路地面格。');
      return false;
    }

    this.dp -= operator.cost;
    this.units.push({
      ...operator,
      col,
      row,
      hp: 1000,
      maxHp: 1000,
      cooldown: 0,
      skillCd: 0,
      skillActive: 0,
      blocked: []
    });
    this.emit('log', `${operator.name} 已部署。`);
    return true;
  }

  retreat(unitIndex) {
    const unit = this.units[unitIndex];
    if (!unit) return;
    const refund = Math.floor(unit.cost / 2);
    this.dp = Math.min(MAX_DP, this.dp + refund);
    this.units.splice(unitIndex, 1);
    this.emit('log', `${unit.name} 已撤退，返还 ${refund} 费用。`);
  }

  skill(unitIndex) {
    const unit = this.units[unitIndex];
    if (!unit || unit.skillCd > 0) {
      this.emit('log', '技能尚未准备完成。');
      return;
    }
    unit.skillActive = unit.skillDuration;
    unit.skillCd = 24;
    this.emit('log', `${unit.name}：${unit.skill}！`);
  }

  spawnEnemy() {
    const wave = this.level.waves[this.wave];
    if (!wave) return;
    const template = ENEMIES[wave.type];
    const route = this.level.map.routes[wave.route % this.level.map.routes.length];
    const maxHp = Math.round(template.hp * this.level.scale);
    this.enemies.push({ ...template, id: crypto.randomUUID?.() ?? `${performance.now()}-${Math.random()}`, hp: maxHp, maxHp, route, routeIndex: 0, routeProgress: 0, x: route[0][0], y: route[0][1], attackCd: 0 });

    this.spawned += 1;
    if (this.spawned >= wave.count) {
      this.wave += 1;
      this.spawned = 0;
      this.nextSpawn = this.time + 2;
      this.emit('log', this.wave < this.level.waves.length ? `第 ${this.wave + 1} 波即将抵达。` : '所有敌人已出现。');
    } else {
      this.nextSpawn = this.time + wave.gap / 1000;
    }
  }

  updateUnits(delta) {
    for (const unit of this.units) {
      unit.cooldown -= delta;
      unit.skillCd = Math.max(0, unit.skillCd - delta);
      unit.skillActive = Math.max(0, unit.skillActive - delta);
      const range = unit.range + (unit.skillActive && unit.name === '银灰' ? 1.7 : 0);
      const targets = this.enemies.filter(enemy => enemy.hp > 0 && distanceToUnit(enemy, unit) <= range);

      if (unit.target === 'heal') {
        const injured = this.units.filter(ally => ally.hp < ally.maxHp && Math.hypot(ally.col - unit.col, ally.row - unit.row) <= range)
          .sort((left, right) => left.hp / left.maxHp - right.hp / right.maxHp)[0];
        if (injured && unit.cooldown <= 0) {
          injured.hp = Math.min(injured.maxHp, injured.hp + unit.atk * (unit.skillActive ? unit.skillMult : 1) * 4);
          unit.cooldown = unit.interval;
          this.bullets.push({ from: unit, to: { x: injured.col + 0.5, y: injured.row + 0.5 }, heal: true, t: 0.18 });
        }
        continue;
      }

      if (!targets.length || unit.cooldown > 0) continue;
      const shotCount = unit.skillActive && unit.name === '能天使' ? 3 : 1;
      const attackTargets = unit.skillActive && unit.name === '银灰' ? targets : targets.slice(0, shotCount);
      for (const enemy of attackTargets) {
        const rawDamage = unit.atk * (unit.skillActive ? unit.skillMult : 1);
        const damage = unit.damage === 'arts' ? Math.max(1, rawDamage * (100 - enemy.res) / 100) : Math.max(1, rawDamage - enemy.def);
        enemy.hp -= damage;
        this.bullets.push({ from: unit, to: enemy, heal: false, t: 0.18 });
      }
      unit.cooldown = unit.interval;
    }
  }

  updateEnemies(delta) {
    for (const enemy of this.enemies) {
      enemy.attackCd -= delta;
      const blocker = this.units.find(unit => this.isRoadTile(unit.col, unit.row) && distanceToUnit(enemy, unit) < 0.52 && unit.blocked.length < (unit.block || 1));
      if (blocker) {
        if (!blocker.blocked.includes(enemy)) blocker.blocked.push(enemy);
        if (enemy.attackCd <= 0) {
          blocker.hp -= enemy.atk;
          enemy.attackCd = 1.2;
        }
      } else {
        const next = enemy.route[enemy.routeIndex + 1];
        if (!next) {
          enemy.hp = 0;
          this.life -= 1;
          this.emit('log', '敌军突破防线！');
          continue;
        }
        const dx = next[0] - enemy.x;
        const dy = next[1] - enemy.y;
        const distance = Math.hypot(dx, dy);
        const travel = enemy.spd * delta;
        if (travel >= distance) {
          enemy.x = next[0]; enemy.y = next[1]; enemy.routeIndex += 1;
        } else {
          enemy.x += dx / distance * travel; enemy.y += dy / distance * travel;
        }
      }
    }
  }

  cleanUp(delta) {
    for (const unit of this.units) unit.blocked = unit.blocked.filter(enemy => enemy.hp > 0);
    for (const enemy of this.enemies.filter(item => item.hp <= 0)) {
      this.kills += 1;
      this.dp = Math.min(MAX_DP, this.dp + enemy.reward);
    }
    this.enemies = this.enemies.filter(enemy => enemy.hp > 0);
    this.units = this.units.filter(unit => unit.hp > 0);
    this.bullets = this.bullets.map(bullet => ({ ...bullet, t: bullet.t - delta })).filter(bullet => bullet.t > 0);
  }

  tick(delta) {
    if (!this.running || this.paused) return;
    const scaledDelta = delta * this.speed;
    this.time += scaledDelta;
    this.dp = Math.min(MAX_DP, this.dp + scaledDelta * 1.05);
    if (this.wave < this.level.waves.length && this.time >= this.nextSpawn) this.spawnEnemy();
    this.updateUnits(scaledDelta);
    this.updateEnemies(scaledDelta);
    this.cleanUp(scaledDelta);

    if (this.life <= 0) { this.running = false; this.over = true; this.emit('end', false); }
    if (this.wave === this.level.waves.length && !this.enemies.length) { this.running = false; this.over = true; this.emit('end', true); }
  }
}
