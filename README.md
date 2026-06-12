# Hotspot Monitor 🔥

智能热点监控系统 --- 多源自动发现 AI/科技热点，AI 验证内容真实性，第一时间推送通知。

## 功能

- **关键词监控**: 输入关键词，自动从 Web + Twitter 多源并行搜集相关内容
- **AI 验证**: 通过 OpenRouter 对接 GPT/Gemini 等模型，识别虚假/低质内容
- **热点追踪**: 定时扫描指定领域热点，可视化展示，点击即跳转原文
- **实时通知**: 发现高相关性验证内容时立即推送通知，点击可跳转源链接
- **已读标记**: 热点和通知支持已读/未读状态，避免重复查看
- **Agent Skills**: 封装为 AI Agent 技能，可交给其他 AI 代理使用

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + Vite + Ant Design Vue 4 |
| 后端 | Node.js + Express |
| 数据库 | SQLite (better-sqlite3) |
| AI | OpenRouter (支持 GPT/Gemini/Claude 等) |
| 数据源 | Bing/Google 网页爬虫 + Twitter API (twitterapi.io) |

## 快速开始

### 方式一：一键启动（推荐）

双击项目根目录的 start.bat，自动完成依赖安装、端口清理、启动前后端。

### 方式二：手动启动

#### 1. 配置 API Key

编辑 ackend/.env:

`env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=google/gemini-2.5-flash
TWITTER_API_KEY=your-twitterapi-key-here
PORT=3001
`

需要的 API Key:
- OPENROUTER_API_KEY: 从 https://openrouter.ai/keys 获取（用于 AI 验证内容）
- TWITTER_API_KEY: 从 https://twitterapi.io/ 获取（用于获取 Twitter 热点）

> 不配置 API Key 也可以运行，但 AI 验证会使用降级模式（仅关键词匹配），Twitter 源会跳过。

#### 2. 启动后端

`ash
cd backend
npm install
npm run dev
`

后端运行在 http://localhost:3001

#### 3. 启动前端

`ash
cd frontend
npm install
npm run dev
`

前端运行在 http://localhost:5173

#### 4. 开始使用

1. 打开 http://localhost:5173
2. 在左侧「关键词」面板添加要监控的关键词
3. 点击顶部「立即扫描」按钮触发一次采集，或等待自动监控周期
4. 点击热点卡片直接跳转原文，右侧通知也可点击跳转

## 监控流程

`
用户添加关键词 -> 定时/手动触发扫描
    |-- Bing/Google 网页搜索（无需 API）
    |-- RSS 订阅源（Hacker News, The Verge AI）
    |-- Twitter API 搜索 + 账号时间线
            |
    OpenRouter AI 分析（相关性 + 真实性）
            |
    去重 -> 入库 -> 推送通知
`

## 作为 Agent Skills 使用

`ash
# 生成热点报告
python .agents/skills/hotspot-monitor/scripts/report.py

# 清理旧数据
python .agents/skills/hotspot-monitor/scripts/cleanup.py --days 7
`

Agent Skills 详情见 .agents/skills/hotspot-monitor/SKILL.md

## 常见问题

| 问题 | 解决 |
|---|---|
| 点击立即扫描没有新通知 | 确保从文件管理器双击 start.bat 启动，不要在 Codex 沙箱内启动后端 |
| OpenRouter 返回 403 | Key 无效或过期，去 openrouter.ai/keys 重新生成 |
| 爬虫无结果 | 网络受限或搜索引擎反爬，等几分钟再试 |
| 端口被占用 | start.bat 会自动杀残留进程；手动启动前先关掉旧进程 |

## 项目结构

`
ai-host-monitor/
|-- backend/                    # Express API 服务
|   |-- src/
|   |   |-- routes/             # API 路由 (keywords/topics/notifications/settings)
|   |   |-- services/           # 核心服务
|   |   |   |-- ai.js           # OpenRouter AI 分析
|   |   |   |-- scraper.js      # Bing/Google 网页爬虫
|   |   |   |-- twitter.js      # Twitter API 集成
|   |   |   |-- scheduler.js    # 定时调度 + 监控主流程
|   |   |-- middleware/         # Express 中间件
|   |   |-- db.js               # SQLite 数据库初始化
|   |   |-- index.js            # 服务入口
|   |-- .env                    # API Key 配置
|   |-- data/                   # SQLite 数据库文件
|-- frontend/                   # Vue 3 前端
|   |-- src/
|   |   |-- components/         # Vue 组件
|   |   |   |-- Header.vue
|   |   |   |-- KeywordManager.vue
|   |   |   |-- HotTopicsFeed.vue
|   |   |   |-- NotificationPanel.vue
|   |   |   |-- Settings.vue
|   |   |-- lib/api.js          # API 封装
|   |   |-- App.vue             # 主布局 + 暗色主题
|   |   |-- main.js             # Vue 入口
|   |   |-- style.css           # 全局样式
|-- .agents/                    # Agent Skills
|   |-- skills/hotspot-monitor/
|       |-- SKILL.md
|       |-- scripts/
|-- start.bat                   # 一键启动脚本 (Windows)
|-- start.ps1                   # PowerShell 启动脚本
|-- README.md
`
