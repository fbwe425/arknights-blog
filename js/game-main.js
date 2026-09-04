import { GameEngine } from './game-engine.js';
import { render } from './game-render.js';
import { createGameUI } from './game-ui.js';

const get = selector => document.querySelector(selector);
const game = new GameEngine();

createGameUI({
  game,
  canvas: get('#board'),
  render,
  elements: {
    level: get('#level'),
    life: get('#life'),
    dp: get('#dp'),
    kills: get('#kills'),
    waves: get('#waves'),
    operators: get('#operators'),
    skills: get('#skills'),
    log: get('#log'),
    start: get('#start'),
    reset: get('#reset'),
    pause: get('#pause'),
    speed: get('#speed')
  }
});
