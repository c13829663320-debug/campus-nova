# 星图校园 · Campus Nova

> 东莞职业技术学院校园探索平台。主站为零构建的单页应用，校园助手由 Node.js 服务调用 OpenRouter。

[在线仓库](https://github.com/Jh-SKILL/campus-nova)

## 功能一览

| 模块 | 说明 |
| --- | --- |
| 星图导览 | 2.5D 等距校园底图，43 栋建筑热区 + 58 个校园 POI，支持片区聚焦放大、地图缩放、分类筛选与建筑档案卡 |
| 3D 与全景 | Blender 校园沙盘支持旋转、缩放、区域切换和地标定位。VR 全景支持在浏览器内环顾、缩放和切换场景，需配置全景素材 |
| 地点详情 | 8 个核心地点的图文画廊、结伴小组（创建 / 加入 / 退出）、到点打卡 |
| 校园活动 | 浏览社团活动和同学发布的找搭子、组局等活动，支持按类型、兴趣和时间筛选，以及报名、退出和取消 |
| 社团图鉴 | 89 个学生社团的真实年审数据，分类与关键词筛选、推荐轮播、社团详情与入社申请 |
| 校园论坛 | 5 个话题分类，发帖、评论、点赞、删除，支持最新 / 最热排序 |
| 我的档案 | 昵称、学院、专业、年级编辑，头像本地上传与压缩存储，成长统计与徽章进度 |
| AI 校园助手 | 用自然语言查询项目里的校园地标和社团，可在同一会话中追问 |
| 用户反馈 | 从主站打开飞书收集表，反馈集中保存在飞书 |
| 全局体验 | 深 / 浅色主题、原生 Hash 路由、事件委托、进度与空态提示 |

## 目录结构

```
campus-nova/
├── index.html              # 主站入口（单页应用）
├── server.cjs              # 托管主站并提供 AI 和反馈配置接口
├── campus-map.html         # 独立 2.5D 校园导览页（58 个 POI 叠加层）
├── map3d.html              # three.js 3D 校园沙盘
├── logo-preview.html       # 品牌视觉预览页
├── styles.css              # 主站样式
├── css/
│   ├── atlas.css           # 星图模块样式
│   └── campus-map.css      # 独立导览页样式
├── js/
│   ├── app.js              # 路由、视图渲染与交互逻辑
│   ├── api.js              # 数据接口层（远程接口 / 本地演示数据自动切换）
│   ├── mock.js             # 地点、片区、建筑、社团、论坛演示数据
│   ├── store.js            # localStorage 状态与业务操作
│   ├── campus-map.js       # 独立导览页渲染
│   └── map3d/              # 3D 沙盘加载、地标与交互
├── data/
│   ├── campus-pois.json    # 58 个 POI 的百分比坐标数据
│   └── campus-map.json     # 3D 地标与区域视角坐标
├── assets/                 # 底图、建筑单元、社团封面与 SVG 标识
└── vendor/three/           # 内置 three.js（无外网依赖）
```

## 本地运行

用 Node.js 22.9 或更新版本。在项目目录打开 PowerShell，复制配置模板并编辑 `.env`。

```powershell
Copy-Item .env.example .env
notepad .env
```

填入自己的 `OPENROUTER_API_KEY`，保存后运行：

```powershell
node --env-file-if-exists=.env server.cjs
```

打开 [http://127.0.0.1:8080/](http://127.0.0.1:8080/)。电脑端入口位于左侧栏，手机端位于底部导航上方。地图、社团、论坛和个人档案也可在此访问。

- `OPENROUTER_MODEL` 默认使用 `openrouter/free`，由 OpenRouter 分配免费模型，受该账号的免费额度和模型可用性限制。
- `FEISHU_FEEDBACK_URL` 可覆盖默认的飞书填写链接。替换时使用飞书表单的填写链接，并按目标用户设置填写范围。
- `HOST` 和 `PORT` 默认绑定本机的 8080 端口。公开部署时，给 `/api/campus-ai` 加访问控制或独立的用量限制。
- 学生活动由单个 Node.js 服务保存到 `NOVA_STATE_DIR`（其次是 systemd 的 `STATE_DIRECTORY`，默认 `.nova-state/`）。部署时使用版本目录外的持久化目录。发起和报名的操作权限绑定当前浏览器。
- 直接双击 `index.html` 仍可浏览主站。使用校园助手以及独立地图的完整功能时，请通过 Node.js 服务打开。

### 接入 VR 全景素材

将可使用的 H5 全景包的 `index.html`、`viewer.js`、`viewer.css`、`scenes.js` 和 `panos/` 放在 `assets/campus-tour/` 下，保持原有目录层级。在主站的「3D 与全景」里选择「进入全景漫游」。未配置素材包时，页面提示暂未开放全景漫游。素材目录已加入 Git 忽略列表，公开部署前请核对素材授权范围。

### 重建 3D 校园模型

模型参考东莞职业技术学院的校园风光和松山湖校区航拍。建筑体量、道路和地标坐标为近似。 [校方校园风光](https://www.dgpt.edu.cn/xygk/xyfg.htm) · [风雨网球场项目航拍](https://www.szhzty.com/sports/89.html)

在项目目录用 Blender 5.2 生成可编辑工程、原始 GLB 和预览，再用 gltfpack 1.3.0 压缩网页模型。

```powershell
blender -b -t 4 --factory-startup --python-exit-code 1 --python scripts/build_campus_model.py -- --blend ../campus.blend --glb ../campus-raw.glb --preview ../campus-preview.png
npx --yes --package=gltfpack@1.3.0 gltfpack -i ../campus-raw.glb -o assets/campus3d/campus.glb -c -ce ext -vp 16
```

将预览 PNG 转成 WebP 后替换 `assets/campus3d/overview.webp`。调整地标模型位置时，同步更新 `data/campus-map.json`。

## 技术说明

- **零构建**：原生 HTML / CSS / JavaScript，无框架、无 npm 依赖，克隆即可运行
- **数据分层**：`mock.js` 提供演示数据，`api.js` 保留 `window.NOVA_API_BASE` 远程接口开关，切换后端无需改动视图层
- **数据存储**：打卡、入社申请、论坛帖子与个人资料存于 localStorage。AI 只发送提问、最近四轮对话与项目公开资料。反馈由飞书表单收集。
- **自适应**：地图与建筑热区统一使用底图百分比坐标，全屏尺寸下保持一致对位

## 数据与素材说明

- 社团名单来源于《2026—2027 学年学生社团拟通过年审、注册及需整改、注销名单》
- 校园地图坐标以底图百分比标注，非测绘数据，仅用于导览演示
- 部分图片素材由 AI 生成，仅用于作品展示；校徽与社团标识仅用于校园文化展示
