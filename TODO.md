# 楠芳·俱乐部 - 用户须知文档

## 📋 需要您准备的内容

### 1. Logo 图片
- **尺寸**: 建议 48x48 像素（1:1比例）
- **格式**: PNG（推荐，支持透明）或 JPG
- **存放位置**: `assets/images/logo.png`
- **说明**: 请将Logo图片命名为 `logo.png` 并放入 `assets/images/` 文件夹

### 2. 活动/公示展示图片
- **尺寸**: 建议 1200x600 像素（2:1比例）
- **格式**: JPG 或 PNG
- **存放位置**: `assets/images/carousel/`
- **命名规则**: `carousel_1.jpg`, `carousel_2.jpg` 等
- **说明**: 首页轮播展示的图片，请根据实际活动准备

### 3. 公告横幅图片
- **尺寸**: 建议 800x200 像素
- **格式**: JPG 或 PNG
- **存放位置**: `assets/images/banners/`
- **说明**: 各个分区的横幅图片

### 4. 默认用户头像
- **尺寸**: 建议 200x200 像素（1:1比例）
- **存放位置**: `assets/images/default_avatar.png`
- **说明**: 用户未设置头像时使用的默认头像

---

## 🚀 一键部署说明（Windows服务器）

### 方式一：自动部署（推荐）

1. 将整个文件夹上传到服务器
2. 右键点击 `deploy.bat`
3. 选择"以管理员身份运行"
4. 等待自动安装完成
5. 自动打开浏览器访问网站

### 方式二：手动部署

```powershell
# 1. 安装Node.js（如果没有）
# 下载地址: https://nodejs.org/

# 2. 进入server目录
cd server

# 3. 安装依赖（可选，核心功能无需额外依赖）
npm install

# 4. 启动服务器
node server.js

# 5. 访问网站
# http://localhost:3000
```

### 常用命令

| 操作 | 命令 |
|------|------|
| 启动服务 | 双击 `start-server.bat` |
| 停止服务 | 双击 `stop-server.bat` |
| 一键部署 | 右键管理员运行 `deploy.bat` |

---

## 🗂️ 项目结构

```
nanfang_club/
├── deploy.bat               # 一键部署脚本（新增）
├── start-server.bat         # 启动服务脚本
├── stop-server.bat          # 停止服务脚本
├── CNAME                    # 域名配置（请勿修改）
├── index.html               # 主页
├── posts.html               # 帖子页（小红书风格）
├── post-detail.html         # 帖子详情页（支持评论、点赞）
├── messages.html            # 消息页面（新增）
├── search.html              # 搜索页
├── settings.html            # 设置页
├── about.html               # 关于页
├── user.html                # 用户主页
├── assets/
│   ├── css/
│   │   ├── main.css         # 主样式
│   │   ├── themes.css       # 主题样式
│   │   ├── components.css   # 组件样式
│   │   └── mobile.css       # 移动端样式
│   ├── js/
│   │   ├── app.js           # 主应用逻辑
│   │   ├── auth.js          # 用户认证
│   │   ├── posts.js         # 帖子功能
│   │   ├── search.js        # 搜索功能
│   │   ├── admin.js         # 管理员功能
│   │   ├── storage.js       # 数据存储
│   │   └── mobile.js        # 移动端功能
│   └── images/
│       ├── logo.png         # Logo（需您添加）
│       ├── default_avatar.png # 默认头像（需您添加）
│       ├── carousel/        # 轮播图片（需您添加）
│       └── banners/         # 横幅图片（需您添加）
├── server/                  # 后端服务
│   ├── server.js            # Node.js 服务器
│   └── package.json         # 依赖配置
├── data/                    # 数据存储目录（自动创建）
├── uploads/                 # 上传文件目录（自动创建）
│   ├── images/              # 图片
│   ├── avatars/             # 头像
│   └── posts/               # 帖子图片
└── TODO.md                  # 本文档
```

---

## 🔧 功能说明

### 用户系统
- 注册需要：QQ号、昵称、届数、密码
- 登录需要：QQ号 + 密码
- 可设置：性别、头像、简介
- 新增：关注/粉丝功能
- 新增：收藏帖子功能

### 帖子系统（全新升级）
- **小红书风格瀑布流展示**
- **图片轮播**：支持多图帖子自动轮播
- **点赞功能**：实时点赞，红心动画
- **收藏功能**：收藏喜欢的帖子
- **评论功能**：
  - 发表评论
  - 回复评论
  - 点赞评论
  - 分页加载
- **关注作者**：一键关注帖子作者
- **浏览量统计**：记录帖子浏览次数
- **分享功能**：复制链接分享

### 消息系统（新增）
- 点赞通知
- 评论通知
- 关注通知
- 系统通知
- 未读消息提醒
- 一键跳转相关内容

### 搜索系统
- 正则表达式过滤
- 模糊匹配
- 按匹配度排序

### 管理员功能
- 密钥验证后进入管理后台
- 可添加/删除帖子
- 可管理首页分区
- 可上传活动图片
- 可管理公告和活动

### 移动端功能
- 自动检测移动设备
- 侧边滑出导航菜单（汉堡菜单）
- 底部固定导航栏
- 移动端专属设置：
  - 深色/浅色主题切换
  - 字体大小调整
- 触摸优化的交互体验
- 响应式布局适配各种屏幕
- 支持右滑关闭菜单
- 安全区域适配（刘海屏）

---

## 📝 数据管理

### 本地开发模式
数据存储在浏览器 localStorage 中：
- 用户数据: `localStorage.users`
- 帖子数据: `localStorage.posts`
- 消息数据: `localStorage.messages`

### 服务器模式
数据存储在 `data/` 目录下的JSON文件中：
- `data/users.json` - 用户数据
- `data/posts.json` - 帖子数据
- `data/messages.json` - 消息数据
- `data/announcements.json` - 公告数据
- `data/activities.json` - 活动数据

### 图片存储
- 帖子图片存储在 `uploads/posts/` 目录
- 用户头像存储在 `uploads/avatars/` 目录
- 其他图片存储在 `uploads/images/` 目录

---

## 📱 API接口列表

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
| `/api/messages` | GET | 获取消息列表 |
| `/api/messages/send` | POST | 发送消息 |
| `/api/messages/read` | POST | 标记消息已读 |
| `/api/search` | GET | 搜索内容 |
| `/api/admin/verify` | POST | 验证管理员密钥 |
| `/api/admin/posts/delete` | POST | 删除帖子 |

---

## ⚠️ 注意事项

1. **请勿修改 CNAME 文件**
2. 所有图片资源需您自行添加
3. 管理员密钥请妥善保管
4. 建议使用现代浏览器（Chrome/Edge/Firefox）
5. 图片会保存在本地 `uploads/` 目录
6. 服务器模式下数据会持久化保存

---

## 🔐 管理员密钥

```
@nf.Control~$$410.J908dawDAwd98dajwd08AQWDF89898adwjikdfaadfw*AWdf87a8wdawdawidhihqeifiAWEFoawdfohoqhwefWQEFIowqejfoweofjowhefWEFJOWEFjhowefoijhjowWEFJFOWEHWEF
```

**请妥善保管此密钥！**

---

## 🌐 域名配置

网站已配置域名: `nanfangclub.naikat.xyz`

如需修改域名，请：
1. 修改 `CNAME` 文件内容
2. 在域名服务商处配置DNS解析

---

如有问题，请检查浏览器控制台是否有错误信息。