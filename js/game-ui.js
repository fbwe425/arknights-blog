import { OPERATORS, LEVELS, GRID } from './game-data.js';

export function createGameUI({ game, canvas, render, elements }) {
  const { level, life, dp, kills, waves, operators, skills, log, start, reset, pause, speed } = elements;
  const state = { lastFrame: 0, layout: null, selectedUnit: null, dirty: true };

  LEVELS.forEach(item => level.add(new Option(`${item.name} · ${item.waves.length} 波`, item.id)));

  function renderState() {
    life.textContent = game.life;
    dp.textContent = Math.floor(game.dp);
    kills.textContent = `${game.kills}/${game.total}`;
    start.disabled = game.running || game.over;
    pause.disabled = !game.running || game.over;
    pause.textContent = game.paused ? '继续行动' : '暂停行动';
    speed.textContent = `${game.speed}× 速度`;
    waves.innerHTML = game.level.waves.map((_, index) => `<i class="wave-dot ${index < game.wave ? 'done' : index === game.wave ? 'now' : ''}"></i>`).join('');
    operators.innerHTML = OPERATORS.map(operator => `
      <button class="td-op ${game.selected?.id === operator.id ? 'active' : ''}" data-operator="${operator.id}">
        <img src="${operator.portrait}" alt="${operator.name}">
        <span><strong>${operator.name}</strong><br><small>${operator.role} · ${operator.skill}</small></span><em>${operator.cost}</em>
      </button>`).join('');
    skills.innerHTML = game.units.length ? game.units.map((unit, index) => `
      <div class="td-unit-control ${state.selectedUnit === index ? 'active' : ''}" data-unit="${index}">
        <button class="td-skill" data-skill="${index}" ${unit.skillCd > 0 ? 'disabled' : ''}>${unit.name} · ${unit.skill} ${unit.skillCd > 0 ? `(${Math.ceil(unit.skillCd)}s)` : ''}</button>
        <button class="td-retreat" data-retreat="${index}">撤退 +${Math.floor(unit.cost / 2)}</button>
      </div>`).join('') : '<small>部署干员后可在这里释放技能。</small>';
    state.dirty = false;
  }

  function frame(timestamp) {
    const delta = Math.min(0.05, (timestamp - state.lastFrame) / 1000 || 0);
    state.lastFrame = timestamp;
    game.tick(delta);
    state.layout = render(canvas, game);
    // Button cooldowns, DP and health move continuously; the small UI is intentionally refreshed once per animation frame.
    renderState();
    requestAnimationFrame(frame);
  }

  game.on('log', message => { log.textContent = message; state.dirty = true; });
  game.on('end', success => { log.textContent = success ? `行动成功！获得 ${Math.max(1, Math.ceil(game.level.id / 5))} 枚行动徽章。` : '行动失败：终端失守。请调整部署后重试。'; state.dirty = true; });

  operators.addEventListener('click', event => { const button = event.target.closest('[data-operator]'); if (button) game.select(button.dataset.operator); });
  skills.addEventListener('click', event => {
    const skillButton = event.target.closest('[data-skill]');
    const retreatButton = event.target.closest('[data-retreat]');
    if (skillButton) game.skill(Number(skillButton.dataset.skill));
    if (retreatButton) game.retreat(Number(retreatButton.dataset.retreat));
  });
  canvas.addEventListener('click', event => {
    if (!state.layout) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left - state.layout.offsetX) / state.layout.cell);
    const row = Math.floor((event.clientY - rect.top - state.layout.offsetY) / state.layout.cell);
    if (col >= 0 && col < GRID.cols && row >= 0 && row < GRID.rows) game.deploy(col, row);
  });
  start.addEventListener('click', () => game.start());
  pause.addEventListener('click', () => game.togglePause());
  speed.addEventListener('click', () => game.toggleSpeed());
  reset.addEventListener('click', () => { game.reset(Number(level.value)); log.textContent = '行动已重置。请选择干员并开始。'; });
  level.addEventListener('change', () => { game.reset(Number(level.value)); log.textContent = '已切换行动。'; });

  level.value = '1';
  game.select('amiya');
  renderState();
  requestAnimationFrame(frame);
}
