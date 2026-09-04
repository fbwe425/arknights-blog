# 罗德岛终端 / Rhodes Island Terminal

一个面向《明日方舟》爱好者的响应式静态网站。项目包含游戏介绍、全量干员图鉴与一套可在浏览器中运行的塔防战术演习。

> 非官方爱好者作品。游戏名称、角色、立绘及相关设定的权利归鹰角网络及其相应权利人所有。

## 在线访问

- **网站首页：** https://arknights-site.pages.dev
- **全量干员图鉴：** https://arknights-site.pages.dev/characters.html
- **塔防战术演习：** https://arknights-site.pages.dev/game.html

## 功能

### 全量干员图鉴

- 接入公开中文游戏资料表中的 **449 名**可部署职业干员。
- 支持按职业筛选、按名称搜索和分批加载。
- 449 张干员立绘作为站内资源随项目提供，避免第三方图片源失效。
- 点击卡片可打开档案详情，查看完整立绘、星级、职业、位置、特性说明和官方资料入口。

### 塔防战术演习

- **50 个行动关卡**，难度随关卡提升。
- 每关包含 3～5 波敌军，危机关卡含精英领袖。
- 可选择阿米娅、能天使、星熊、闪灵、银灰并在网格中自由部署。
- 区分高台与地面部署格；具备费用回复、阻挡、敌方攻击、生命点、击杀奖励与失败/胜利判定。
- 每位干员具备不同攻击范围、伤害类型与可手动释放的技能。
- 敌军包括猎犬、士兵、术师、重装防御者、无人机与精英领袖等不同模型和属性。

## 项目结构

```text
.
├── index.html                 # 首页
├── characters.html            # 干员图鉴与详情弹窗
├── game.html                  # 塔防游戏页面
├── style.css                  # 站点共享样式
├── game.css                   # 塔防专用样式
├── assets/
│   ├── all-portraits/         # 449 张干员立绘
│   └── data/operators.json    # 干员资料数据
└── js/
    ├── game-data.js           # 50关、干员与敌人配置
    ├── game-engine.js         # 战斗、部署、技能与波次逻辑
    └── game-render.js         # Canvas 战场渲染
```

## 本地预览

无需安装依赖。使用任意静态文件服务器在项目目录中启动：

```bash
python3 -m http.server 8765
```

然后访问 `http://127.0.0.1:8765`。

## 部署

该项目是纯静态站点，可直接部署到 Cloudflare Pages：

```bash
npx wrangler pages deploy . --project-name arknights-site --branch main
```

也可使用 GitHub Pages、Netlify、Vercel 或其他静态托管服务。

## 数据与素材说明

干员文本资料由公开的游戏数据表整理；立绘使用公开素材并作为静态资源存放于本站。此仓库仅用于学习与交流，不应用于商业用途。
