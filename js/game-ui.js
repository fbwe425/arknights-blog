import { OPERATORS, LEVELS, GRID } from './game-data.js?v=map-progress-1';
import { loadProgress, rewardForWin } from './game-progress.js?v=map-progress-1';

export function createGameUI({ game, canvas, render, elements }) {
  const { level, life, dp, kills, waves, operators, skills, log, start, reset, pause, speed, mapName, mapTrait, reward } = elements;
  const progress = loadProgress();
  const state = { lastFrame: 0, layout: null, preview: null };

  function refreshLevels() {
    level.innerHTML = LEVELS.map(item => {
      const unlocked = item.id === 1 || progress.cleared.has(item.id - 1);
      return `<option value="${item.id}" ${unlocked ? '' : 'disabled'}>${item.name}${progress.cleared.has(item.id) ? ' · 已完成' : unlocked ? '' : ' · 未解锁'}</option>`;
    }).join('');
  }

  function renderState() {
    life.textContent = game.life;
    dp.textContent = Math.floor(game.dp);
    kills.textContent = `${game.kills}/${game.total}`;
    start.disabled = game.running || game.over;
    pause.disabled = !game.running || game.over;
    pause.textContent = game.paused ? '▶ 继续' : 'Ⅱ 暂停';
    speed.textContent = `${game.speed}× 速度`;
    mapName.textContent = game.level.map.name;
    mapTrait.textContent = game.level.map.trait;
    reward.textContent = game.level.reward ? `首通奖励：${OPERATORS.find(item => item.id === game.level.reward)?.name}` : '首通奖励：行动徽章';
    waves.innerHTML = game.level.waves.map((_, index) => `<i class="wave-dot ${index < game.wave ? 'done' : index === game.wave ? 'now' : ''}"></i>`).join('');
    operators.innerHTML = OPERATORS.map(operator => {
      const unlocked = progress.unlocked.has(operator.id);
      return `<button class="td-op ${game.selected?.id === operator.id ? 'active' : ''}" data-operator="${operator.id}" ${unlocked ? '' : 'disabled'}>
        <img src="${operator.portrait}" alt="${operator.name}"><span><strong>${operator.name}</strong><br><small>${unlocked ? `${operator.role} · ${operator.skill}` : `完成行动 ${operator.unlockLevel} 解锁`}</small></span><em>${unlocked ? operator.cost : '锁定'}</em>
      </button>`;
    }).join('');
    skills.innerHTML = game.units.length ? game.units.map((unit, index) => `<div class="td-unit-control"><button class="td-skill" data-skill="${index}" ${unit.skillCd > 0 ? 'disabled' : ''}>${unit.name} · ${unit.skill} ${unit.skillCd > 0 ? `(${Math.ceil(unit.skillCd)}s)` : ''}</button><button class="td-retreat" data-retreat="${index}">撤退 +${Math.floor(unit.cost / 2)}</button></div>`).join('') : '<small>部署干员后可在这里释放技能。</small>';
  }

  function setPreview(event) {
    if (!state.layout || !game.selected) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left - state.layout.offsetX) / state.layout.cell);
    const row = Math.floor((event.clientY - rect.top - state.layout.offsetY) / state.layout.cell);
    state.preview = col >= 0 && col < GRID.cols && row >= 0 && row < GRID.rows ? { ...game.selected, col, row, valid: game.isValidTile(game.selected, col, row) && !game.units.some(unit => unit.col === col && unit.row === row) } : null;
  }

  function frame(timestamp) {
    const delta = Math.min(0.05, (timestamp - state.lastFrame) / 1000 || 0);
    state.lastFrame = timestamp;
    game.tick(delta);
    state.layout = render(canvas, game, state.preview);
    renderState();
    requestAnimationFrame(frame);
  }

  game.on('log', message => { log.textContent = message; });
  game.on('end', success => {
    if (!success) { log.textContent = '行动失败：终端失守。请调整部署后重试。'; return; }
    const operatorId = rewardForWin(progress, game.level);
    const name = operatorId ? OPERATORS.find(item => item.id === operatorId)?.name : '';
    log.textContent = name ? `行动成功！获得新干员：${name}。` : '行动成功！获得行动徽章。';
    refreshLevels();
  });

  operators.addEventListener('click', event => { const button = event.target.closest('[data-operator]'); if (button && !button.disabled) game.select(button.dataset.operator); });
  skills.addEventListener('click', event => { const skillButton = event.target.closest('[data-skill]'); const retreatButton = event.target.closest('[data-retreat]'); if (skillButton) game.skill(Number(skillButton.dataset.skill)); if (retreatButton) game.retreat(Number(retreatButton.dataset.retreat)); });
  canvas.addEventListener('mousemove', setPreview);
  canvas.addEventListener('mouseleave', () => { state.preview = null; });
  canvas.addEventListener('click', event => { setPreview(event); if (state.preview?.valid) game.deploy(state.preview.col, state.preview.row); });
  start.addEventListener('click', () => game.start());
  pause.addEventListener('click', () => game.togglePause());
  speed.addEventListener('click', () => game.toggleSpeed());
  reset.addEventListener('click', () => { game.reset(Number(level.value)); state.preview = null; log.textContent = '行动已重置。请选择干员并开始。'; });
  level.addEventListener('change', () => { game.reset(Number(level.value)); state.preview = null; log.textContent = '已切换行动。'; });

  refreshLevels();
  const availableLevels = LEVELS.filter(item => item.id === 1 || progress.cleared.has(item.id - 1));
  level.value = String(availableLevels.at(-1)?.id ?? 1);
  game.reset(Number(level.value));
  renderState();
  requestAnimationFrame(frame);
}
