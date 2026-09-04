import { GameEngine } from './game-engine.js?v=map-progress-1';
import { render } from './game-render.js?v=map-progress-1';
import { createGameUI } from './game-ui.js?v=map-progress-1';

const get = selector => document.querySelector(selector);
const game = new GameEngine();

try {
  createGameUI({
    game,
    canvas: get('#board'),
    render,
    elements: {
      level: get('#level'), life: get('#life'), dp: get('#dp'), kills: get('#kills'), waves: get('#waves'),
      operators: get('#operators'), skills: get('#skills'), log: get('#log'), start: get('#start'), reset: get('#reset'),
      pause: get('#pause'), speed: get('#speed'), mapName: get('#map-name'), mapTrait: get('#map-trait'), reward: get('#reward')
    }
  });
} catch (error) {
  get('#log').textContent = `战术终端初始化失败：${error.message}`;
  console.error(error);
}
