import { GRID } from './game-data.js';

const imageCache = new Map();

function getPortrait(src) {
  if (!imageCache.has(src)) {
    const image = new Image();
    image.src = src;
    imageCache.set(src, image);
  }
  return imageCache.get(src);
}

function drawGrid(context, layout) {
  const { cell, offsetX, offsetY } = layout;
  context.fillStyle = '#132233';
  context.fillRect(0, 0, layout.width, layout.height);

  for (let row = 0; row < GRID.rows; row += 1) {
    for (let col = 0; col < GRID.cols; col += 1) {
      context.fillStyle = row === 3 || row === 4 ? '#65747a' : row < 4 ? '#294055' : '#314237';
      context.fillRect(offsetX + col * cell, offsetY + row * cell, cell - 1, cell - 1);
    }
  }

  context.fillStyle = '#00d8dd';
  context.fillRect(offsetX + (GRID.cols - 0.18) * cell, offsetY + 3 * cell, 0.16 * cell, 2 * cell);
}

function drawEnemy(context, enemy, layout) {
  const { cell, offsetX, offsetY } = layout;
  const x = offsetX + enemy.x * cell;
  const y = offsetY + enemy.y * cell;
  const size = cell * 0.2;

  context.fillStyle = enemy.color;
  context.beginPath();
  if (enemy.model === 'drone') {
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#dff';
    context.stroke();
  } else {
    context.fillRect(x - size * 0.9, y - size * 1.1, size * 1.8, size * 2.2);
    context.fillStyle = '#15202c';
    context.fillRect(x - size * 1.25, y - size * 1.7, size * 2.5, size * 0.4);
  }

  context.fillStyle = '#200';
  context.fillRect(x - size * 1.1, y - size * 1.7, size * 2.2, 4);
  context.fillStyle = '#e65059';
  context.fillRect(x - size * 1.1, y - size * 1.7, size * 2.2 * enemy.hp / enemy.maxHp, 4);
}

function drawUnit(context, unit, layout) {
  const { cell, offsetX, offsetY } = layout;
  const x = offsetX + (unit.col + 0.5) * cell;
  const y = offsetY + (unit.row + 0.5) * cell;
  const image = getPortrait(unit.portrait);
  const radius = cell * 0.28;

  context.strokeStyle = unit.skillActive ? '#ffd45c' : '#00d8dd';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.stroke();

  context.save();
  context.beginPath();
  context.arc(x, y, radius * 0.85, 0, Math.PI * 2);
  context.clip();
  if (image.complete) context.drawImage(image, x - cell * 0.25, y - cell * 0.34, cell * 0.5, cell * 0.68);
  context.restore();

  context.fillStyle = '#09131d';
  context.fillRect(x - cell * 0.26, y + cell * 0.31, cell * 0.52, 4);
  context.fillStyle = '#49d5ef';
  context.fillRect(x - cell * 0.26, y + cell * 0.31, cell * 0.52 * unit.hp / unit.maxHp, 4);
}

export function render(canvas, game) {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const pixelWidth = Math.round(width * devicePixelRatio);
  const pixelHeight = Math.round(height * devicePixelRatio);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  const context = canvas.getContext('2d');
  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  const cell = Math.min(width / GRID.cols, height / GRID.rows);
  const layout = { cell, offsetX: (width - GRID.cols * cell) / 2, offsetY: (height - GRID.rows * cell) / 2, width, height };

  drawGrid(context, layout);
  game.enemies.forEach(enemy => drawEnemy(context, enemy, layout));
  game.units.forEach(unit => drawUnit(context, unit, layout));

  for (const bullet of game.bullets) {
    context.strokeStyle = bullet.heal ? '#7fffe5' : '#ffd45c';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(layout.offsetX + (bullet.from.col + 0.5) * cell, layout.offsetY + (bullet.from.row + 0.5) * cell);
    context.lineTo(layout.offsetX + bullet.to.x * cell, layout.offsetY + bullet.to.y * cell);
    context.stroke();
  }

  return { cell, offsetX: layout.offsetX, offsetY: layout.offsetY };
}
