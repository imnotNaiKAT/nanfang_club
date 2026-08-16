# 楠芳·俱乐部

株洲市南方中学学生自主交流社区网站。

> ⚠️ **免责声明**：本网站为非官方个人网站，仅供株洲市南方中学在校学生使用。本站内容由用户自行发布，不代表学校官方立场。请文明发言，遵守相关法律法规。

---

## 功能特性

### 🏠 主页
- 轮播图展示（管理员可后台管理）
- 公告 / 活动分区展示
- 自定义分区（管理员可动态添加）
- 响应式设计，移动端适配

### 📝 帖子系统（仿小红书）
- 瀑布流卡片布局
- 支持 Markdown 格式
- 图片上传（本地存储）
- 文件附件
- 标签分类

### 💬 社交互动
- ❤️ 点赞 / ⭐ 收藏
- 💬 评论 & 多级回复
- 👥 关注 / 粉丝
- 📢 消息通知（点赞/评论/关注/系统）

### 🔍 搜索
- 关键词搜索
- 正则表达式过滤
- 模糊匹配
- 按匹配度排序

### ⚙️ 设置 & 个人中心
- 账号信息管理（昵称、性别、头像、简介）
- 主题切换（亮色/暗色）
- 字体大小调整
- 隐私设置

### 🔑 管理员后台
- 安全密钥验证
- 轮播图管理
- 分区管理
- 帖子审核/删除
- 公告/活动发布
- 用户管理
- 数据导入/导出

---

## 技术栈

- **后端**：Node.js（原生 http 模块，无第三方依赖）
- **前端**：原生 HTML5 + CSS3 + JavaScript
- **存储**：服务器文件系统（JSON 持久化）
- **图片**：本地存储（`uploads/` 目录）

---

## 快速开始

### 1. 安装 Node.js
- 下载：https://nodejs.org/
- 选择 LTS 版本（v18+ 推荐）
- 安装后重启命令行

### 2. 启动服务器

```powershell
# 方式 A：双击 start-server.bat（推荐）

# 方式 B：手动启动
cd server
node server.js
```

### 3. 访问网站
浏览器打开 `http://localhost:3000`

---

## 项目结构

```
nanfang_club/
├── assets/
│   ├── css/
│   │   ├── main.css          # 主样式
│   │   ├── themes.css        # 主题样式（亮/暗）
│   │   ├── components.css    # 组件样式
│   │   └── mobile.css        # 移动端样式
│   ├── js/
│   │   ├── config.js          # 全局配置
│   │   ├── storage.js         # 本地存储（仅UI偏好）
│   │   ├── api.js            # API 客户端
│   │   ├── auth.js           # 用户认证
│   │   ├── admin.js          # 管理员功能
│   │   ├── app.js            # 应用主逻辑
│   │   ├── search.js         # 搜索功能
│   │   ├── posts.js          # 帖子功能
│   │   └── mobile.js         # 移动端适配
│   └── images/               # 静态图片资源
├── server/
│   ├── server.js             # Node.js 服务器
│   └── package.json          # 项目配置
├── data/                     # 数据存储（自动创建）
│   ├── users.json
│   ├── posts.json
│   ├── messages.json
│   ├── carousel.json
│   ├── sections.json
│   ├── announcements.json
│   └── activities.json
├── uploads/                  # 上传文件（自动创建）
│   ├── images/
│   ├── avatars/
│   └── posts/
├── index.html               # 主页
├── posts.html               # 帖子列表
├── post-detail.html         # 帖子详情
├── create-post.html         # 发布帖子
├── search.html              # 搜索页
├── settings-new.html        # 设置页
├── user.html                # 用户主页
├── messages.html            # 消息页
├── about.html               # 关于页
├── start-server.bat         # 启动脚本
├── stop.bat                 # 停止脚本
├── deploy.bat               # 一键部署
├── DEPLOYMENT.md            # 部署文档
└── README-SIMPLE.md         # 本文档
```

---

## 管理员密钥

```
@nf.Control~$$410.J908dawDAwd98dajwd08AQWDF89898adwjikdfaadfw*AWdf87a8wdawdawidhihqeifiAWEFoawdfohoqhwefWQEFIowqejfoweofjowhefWEFJOWEFjhowefoijhjowWEFJFOWEHWEF
```

⚠️ **请妥善保管，不要泄露！**

---

## 部署指南

详细部署说明请参阅 [DEPLOYMENT.md](DEPLOYMENT.md)。

### 局域网访问
```powershell
# 获取本机IP
ipconfig
# 其他设备访问 http://本机IP:3000
```

### 端口修改
编辑 `server/server.js` 第 7 行：
```javascript
const PORT = process.env.PORT || 3000;
```

---

## 数据备份

定期备份以下目录：
- `data/` — 所有用户和帖子数据
- `uploads/` — 所有上传图片

---

## 版本信息

- **版本**：2.0.0
- **年份**：2026
- **适用平台**：Windows 10 / Windows Server 2016+

---

## 更新日志

### v2.0.0 (2026)
- ✨ 全面重构为服务器架构
- ✨ 小红书风格瀑布流帖子
- ✨ 评论、点赞、收藏、关注
- ✨ 消息通知系统
- ✨ 管理员后台（轮播图/分区/帖子管理）
- ✨ 图片本地上传存储
- ✨ 移动端响应式适配
- ✨ 亮色/暗色主题
- ✨ 正则 & 模糊搜索

### v1.0.0
- 基础网站功能
- 用户注册登录
- 帖子发布查看
- 搜索功能
- 管理员面板

---

© 2026 楠芳·俱乐部 - 株洲市南方中学