import { OPERATORS, LEVELS } from './game-data.js';

export function createGameUI({ game, canvas, render, elements }) {
  const { level, life, dp, kills, waves, operators, skills, log, start, reset } = elements;
  const state = { lastFrame: 0, layout: null };

  LEVELS.forEach(item => level.add(new Option(`${item.name} · ${item.waves.length} 波`, item.id)));

  function renderState() {
    life.textContent = game.life;
    dp.textContent = Math.floor(game.dp);
    kills.textContent = `${game.kills}/${game.total}`;
    waves.innerHTML = game.level.waves.map((_, index) => `<i class="wave-dot ${index < game.wave ? 'done' : index === game.wave ? 'now' : ''}"></i>`).join('');
    operators.innerHTML = OPERATORS.map(operator => `
      <button class="td-op ${game.selected?.id === operator.id ? 'active' : ''}" data-operator="${operator.id}">
        <img src="${operator.portrait}" alt="${operator.name}">
        <span><strong>${operator.name}</strong><br><small>${operator.role} · ${operator.skill}</small></span>
        <em>${operator.cost}</em>
      </button>`).join('');
    skills.innerHTML = game.units.length ? game.units.map((unit, index) => `
      <button class="td-skill" data-skill="${index}" ${unit.skillCd > 0 ? 'disabled' : ''}>
        ${unit.name} · ${unit.skill} ${unit.skillCd > 0 ? `(${Math.ceil(unit.skillCd)}s)` : ''}
      </button>`).join('') : '<small>部署干员后可在这里释放技能。</small>';
  }

  function frame(timestamp) {
    const delta = Math.min(0.05, (timestamp - state.lastFrame) / 1000 || 0);
    state.lastFrame = timestamp;
    game.tick(delta);
    state.layout = render(canvas, game);
    renderState();
    requestAnimationFrame(frame);
  }

  game.on('log', message => { log.textContent = message; });
  game.on('end', success => { log.textContent = success ? '行动成功！可选择下一关继续演习。' : '行动失败：终端失守。请调整部署后重试。'; });

  operators.addEventListener('click', event => {
    const button = event.target.closest('[data-operator]');
    if (button) game.select(button.dataset.operator);
  });
  skills.addEventListener('click', event => {
    const button = event.target.closest('[data-skill]');
    if (button) game.skill(Number(button.dataset.skill));
  });
  canvas.addEventListener('click', event => {
    if (!state.layout) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left - state.layout.offsetX) / state.layout.cell);
    const row = Math.floor((event.clientY - rect.top - state.layout.offsetY) / state.layout.cell);
    if (col >= 0 && col < 12 && row >= 0 && row < 7) game.deploy(col, row);
  });
  start.addEventListener('click', () => game.start());
  reset.addEventListener('click', () => { game.reset(Number(level.value)); log.textContent = '行动已重置。请选择干员并开始。'; });
  level.addEventListener('change', () => { game.reset(Number(level.value)); log.textContent = '已切换行动。'; });

  level.value = '1';
  game.select('amiya');
  renderState();
  requestAnimationFrame(frame);
}
