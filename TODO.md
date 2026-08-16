# 楠芳·俱乐部 - 用户须知

> ⚠️ **免责声明**：本网站为非官方个人网站，仅供株洲市南方中学在校学生使用。本站内容由用户自行发布，不代表学校官方立场。

---

## 需要您准备的内容

### 1. Logo 图片
- **尺寸**: 建议 48×48 像素（1:1 比例）
- **格式**: PNG（推荐，支持透明）或 JPG
- **存放位置**: `assets/images/logo.png`
- **说明**: 网站左上角 Logo，请命名为 `logo.png`

### 2. 活动/公示展示图片
- **尺寸**: 建议 1200×600 像素（2:1 比例）
- **格式**: JPG 或 PNG
- **存放位置**: 通过管理员后台上传（自动存储到 `uploads/`）
- **说明**: 首页轮播图，在管理员后台添加

### 3. 公告横幅图片
- **尺寸**: 建议 800×200 像素
- **格式**: JPG 或 PNG
- **说明**: 各区板块横幅，在管理员后台上传

### 4. 默认用户头像
- **尺寸**: 建议 200×200 像素（1:1 比例）
- **存放位置**: `assets/images/default_avatar.png`
- **说明**: 用户未设置头像时使用

---

## 一键部署说明（Windows 服务器）

### 方式一：自动部署（推荐）

1. 将整个文件夹上传到服务器
2. 右键点击 `deploy.bat`（需管理员权限）
3. 等待自动安装完成
4. 自动打开浏览器访问 `http://localhost:3000`

### 方式二：手动启动

```powershell
# 1. 安装 Node.js（v18+）
#    下载：https://nodejs.org/

# 2. 进入 server 目录
cd server

# 3. 启动服务器
node server.js

# 4. 访问网站
# http://localhost:3000
```

### 常用命令

| 操作 | 方法 |
|------|------|
| 启动服务 | 双击 `start-server.bat` |
| 停止服务 | 双击 `stop.bat` |
| 一键部署 | 右键管理员运行 `deploy.bat` |

---

## 项目结构

```
nanfang_club/
├── deploy.bat               # 一键部署脚本
├── start-server.bat         # 启动服务脚本
├── stop.bat                 # 停止服务脚本
├── CNAME                    # 域名配置（请勿修改）
├── README-SIMPLE.md         # 项目说明文档
├── DEPLOYMENT.md            # 部署文档
├── TODO.md                  # 本文档
├── index.html               # 主页
├── posts.html               # 帖子页（小红书风格）
├── post-detail.html         # 帖子详情（评论/点赞/收藏）
├── create-post.html         # 发布帖子
├── messages.html            # 消息中心
├── search.html              # 搜索页
├── settings-new.html        # 设置 & 管理员面板
├── about.html               # 关于页
├── user.html                # 用户主页
├── assets/
│   ├── css/
│   │   ├── main.css         # 主样式
│   │   ├── themes.css       # 主题样式
│   │   ├── components.css   # 组件样式
│   │   └── mobile.css       # 移动端样式
│   ├── js/
│   │   ├── config.js        # 全局配置
│   │   ├── storage.js       # UI偏好存储
│   │   ├── api.js           # API 客户端
│   │   ├── auth.js          # 用户认证
│   │   ├── posts.js         # 帖子功能
│   │   ├── search.js        # 搜索功能
│   │   ├── admin.js         # 管理员功能
│   │   ├── app.js           # 应用主逻辑
│   │   └── mobile.js        # 移动端适配
│   └── images/
│       ├── logo.png         # Logo（需您添加）
│       └── default_avatar.png # 默认头像（需您添加）
├── server/
│   ├── server.js            # Node.js 服务器
│   └── package.json         # 项目配置
├── data/                    # 数据存储（自动创建）
└── uploads/                 # 上传文件（自动创建）
    ├── images/
    ├── avatars/
    └── posts/
```

---

## 功能说明

### 用户系统
- 注册：QQ号（仅判重）+ 昵称 + 届数 + 密码 + 性别
- 登录：QQ号 + 密码
- 可设置：性别、头像、简介
- 关注/粉丝、收藏

### 帖子系统（小红书风格）
- 瀑布流卡片布局
- 多图轮播展示
- 点赞 / 收藏 / 评论 / 回复
- 关注作者
- 浏览量统计
- 支持 Markdown 格式

### 消息系统
- 点赞通知
- 评论通知
- 关注通知
- 系统通知
- 未读消息提醒

### 搜索系统
- 关键词搜索
- 正则表达式过滤
- 模糊匹配
- 按匹配度排序

### 管理员功能
- 密钥验证后进入管理后台
- 管理轮播图（上传/删除）
- 管理自定义分区（添加/删除）
- 管理帖子（删除违规内容）
- 发布公告和活动
- 数据统计
- 数据导入/导出

### 移动端功能
- 响应式布局，自动适配屏幕
- 侧边滑出导航菜单
- 底部固定导航栏
- 移动端专属设置
- 深色/浅色主题切换
- 字体大小调整
- 触摸优化交互

---

## 数据管理

### 服务器数据存储
所有数据存储在服务器文件系统：
- `data/users.json` — 用户数据
- `data/posts.json` — 帖子数据
- `data/messages.json` — 消息数据
- `data/carousel.json` — 轮播图数据
- `data/sections.json` — 分区数据
- `data/announcements.json` — 公告数据
- `data/activities.json` — 活动数据

### 图片存储
- 帖子图片 → `uploads/posts/`
- 用户头像 → `uploads/avatars/`
- 轮播图等 → `uploads/images/`

### UI 偏好存储
以下内容仅保存在浏览器（localStorage）：
- 主题设置（亮/暗）
- 字体大小
- 管理员验证状态

---

## API 接口列表

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/users/register` | POST | 用户注册 |
| `/api/users/login` | POST | 用户登录 |
| `/api/users/:id` | GET | 获取用户信息 |
| `/api/users/update` | POST | 更新用户信息 |
| `/api/users/follow` | POST | 关注/取消关注 |
| `/api/posts` | GET | 获取帖子列表 |
| `/api/posts/:id` | GET | 获取帖子详情 |
| `/api/posts/create` | POST | 发布帖子 |
| `/api/posts/like` | POST | 点赞/取消点赞 |
| `/api/posts/collect` | POST | 收藏/取消收藏 |
| `/api/posts/comment` | POST | 发表评论 |
| `/api/upload/image` | POST | 上传图片 |
| `/api/upload/avatar` | POST | 上传头像 |
| `/api/carousel` | GET | 获取轮播图 |
| `/api/sections` | GET | 获取分区列表 |
| `/api/announcements` | GET | 获取公告列表 |
| `/api/activities` | GET | 获取活动列表 |
| `/api/messages` | GET | 获取消息列表 |
| `/api/messages/read` | POST | 标记消息已读 |
| `/api/search` | GET | 搜索内容 |
| `/api/admin/verify` | POST | 验证管理员密钥 |
| `/api/admin/stats` | GET | 获取管理员统计 |
| `/api/admin/posts/delete` | POST | 删除帖子 |
| `/api/admin/carousel` | POST | 添加轮播图 |
| `/api/admin/carousel/delete` | POST | 删除轮播图 |
| `/api/admin/sections` | POST | 添加分区 |
| `/api/admin/sections/delete` | POST | 删除分区 |

---

## 注意事项

1. **请勿修改 CNAME 文件**
2. 所有图片资源需您自行添加
3. 管理员密钥请妥善保管
4. 建议使用现代浏览器（Chrome / Edge / Firefox）
5. 图片保存在服务器 `uploads/` 目录
6. 数据定期备份 `data/` 和 `uploads/` 目录
7. 服务器需开放 3000 端口

---

## 管理员密钥

```
@nf.Control~$$410.J908dawDAwd98dajwd08AQWDF89898adwjikdfaadfw*AWdf87a8wdawdawidhihqeifiAWEFoawdfohoqhwefWQEFIowqejfoweofjowhefWEFJOWEFjhowefoijhjowWEFJFOWEHWEF
```

**请妥善保管！**

---

## 域名配置

网站域名：`nanfangclub.naikat.xyz`

如需修改域名：
1. 修改 `CNAME` 文件内容
2. 在域名服务商处配置 DNS 解析

---

如有问题，请检查浏览器控制台或服务器日志。