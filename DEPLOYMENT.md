# 楠芳·俱乐部 - 部署说明

> ⚠️ **免责声明**：本网站为非官方个人网站，仅供株洲市南方中学在校学生使用。本站内容由用户自行发布，不代表学校官方立场。

---

## 快速开始

### 最简单的部署方式：

#### 1. 安装 Node.js
- 下载：https://nodejs.org/（选择 LTS 版本，推荐 v18+）
- 安装后重启命令行

#### 2. 启动服务器
```
方式 A（推荐）：双击 start-server.bat
方式 B：双击 deploy.bat（需管理员权限，自动配置防火墙）
方式 C：手动启动
    → cd server
    → node server.js
```

#### 3. 访问网站
浏览器打开 `http://localhost:3000`

---

## 系统概述

楠芳·俱乐部是一个模仿小红书的社区网站，专为株洲市南方中学学生打造。

### 主要功能

#### 用户系统
- 用户注册（QQ号、昵称、年级、密码、性别）
- 用户登录（QQ号 + 密码）
- 个人信息管理（头像、简介、性别）
- 用户主页展示
- 关注/粉丝系统

#### 帖子系统
- 小红书风格瀑布流布局
- 发布帖子（文字、图片、标签、Markdown）
- 帖子详情页（多图轮播）
- 浏览量统计

#### 社交功能
- ❤️ 点赞帖子
- ⭐ 收藏帖子
- 💬 评论帖子（支持多级回复）
- 👥 关注用户
- 📢 消息通知系统

#### 搜索功能
- 关键词搜索
- 正则表达式搜索
- 模糊匹配
- 按匹配度排序

#### 管理员功能
- 安全密钥验证
- 删除帖子
- 管理轮播图
- 管理自定义分区
- 发布公告和活动
- 数据导入/导出

---

## 一键部署（Windows 10 / Windows Server）

### 方式一：自动部署（推荐）

#### 步骤 1：安装 Node.js
1. 访问 https://nodejs.org/
2. 下载 **LTS 版本**（v18 或 v20）
3. 运行安装程序，按默认设置安装
4. 安装完成后，**重启命令行窗口**

#### 步骤 2：上传项目
将整个项目文件夹上传到服务器，例如：`C:\nanfang_club`

#### 步骤 3：运行部署脚本
1. 找到项目根目录下的 `deploy.bat`
2. **右键点击** → **以管理员身份运行**
3. 等待自动安装完成（约 1-2 分钟）

#### 步骤 4：访问网站
部署完成后，脚本会自动打开浏览器访问：
```
http://localhost:3000
```

### 方式二：手动部署

```powershell
# 1. 安装 Node.js（v18+）
#    下载：https://nodejs.org/

# 2. 进入项目目录
cd C:\nanfang_club\server

# 3. 启动服务器
node server.js

# 4. 访问网站
# http://localhost:3000
```

---

## 局域网 / 公网访问

### 局域网访问
```powershell
# 获取服务器IP
ipconfig
# 其他设备访问 http://本机IP:3000
```

### 公网访问
1. 云服务器安全组开放 3000 端口
2. 或配置 Nginx 反向代理

### 防火墙配置
```powershell
netsh advfirewall firewall add rule name="楠芳俱乐部" dir=in action=allow protocol=tcp localport=3000
```

---

## 项目结构

```
nanfang_club/
├── assets/
│   ├── css/
│   │   ├── main.css          # 主样式
│   │   ├── themes.css        # 主题样式
│   │   ├── components.css    # 组件样式
│   │   └── mobile.css        # 移动端样式
│   ├── js/
│   │   ├── config.js          # 全局配置
│   │   ├── storage.js         # UI偏好存储
│   │   ├── api.js            # API 客户端
│   │   ├── auth.js           # 用户认证
│   │   ├── admin.js          # 管理员功能
│   │   ├── app.js            # 应用主逻辑
│   │   ├── search.js         # 搜索功能
│   │   ├── posts.js          # 帖子功能
│   │   └── mobile.js         # 移动端适配
│   └── images/               # 图片资源
├── server/
│   ├── server.js             # Node.js 服务器
│   └── package.json          # 项目配置
├── data/                     # 数据目录（自动创建）
│   ├── users.json
│   ├── posts.json
│   ├── messages.json
│   ├── carousel.json
│   ├── sections.json
│   ├── announcements.json
│   └── activities.json
├── uploads/                  # 上传目录（自动创建）
│   ├── images/
│   ├── avatars/
│   └── posts/
├── index.html               # 主页
├── posts.html               # 帖子列表
├── post-detail.html         # 帖子详情
├── create-post.html         # 发布帖子
├── search.html              # 搜索
├── settings-new.html        # 设置 & 管理员面板
├── user.html                # 用户主页
├── messages.html            # 消息中心
├── about.html               # 关于
├── start-server.bat         # 启动脚本
├── stop.bat                 # 停止脚本
├── deploy.bat               # 一键部署
├── DEPLOYMENT.md            # 本文档
├── README-SIMPLE.md         # 项目说明
└── CNAME                    # 域名配置（请勿修改）
```

---

## API 接口文档

### 通用说明
- 所有接口返回 JSON 格式：`{ success: boolean, ...data }`
- 认证接口需要在请求头携带 `Authorization: Bearer <sessionKey>`
- 或通过查询参数 `?session=<sessionKey>` 传递

### 用户相关

#### 注册
```
POST /api/users/register
Body: { qq, nickname, grade, password, gender }
Response: { success, message, user }
```

#### 登录
```
POST /api/users/login
Body: { qq, password }
Response: { success, message, user, sessionKey }
```

#### 获取用户信息
```
GET /api/users/:userId
Response: { success, user: { id, qq, nickname, grade, avatar, bio, gender, ... } }
```

#### 更新用户信息
```
POST /api/users/update
Body: { userId, nickname, gender, bio, avatar, password }
Response: { success, message }
```

#### 注销账号
```
POST /api/users/update
Body: { userId, deleteAccount: true }
Response: { success, message }
```

#### 关注/取消关注
```
POST /api/users/follow
Body: { userId, targetId }
Response: { success, following }
```

### 帖子相关

#### 发布帖子
```
POST /api/posts/create
Body: { title, content, authorId, images, tags, section }
Response: { success, message, post }
```

#### 获取帖子列表
```
GET /api/posts?page=1&limit=20&authorId=xxx&section=xxx
Response: { success, posts, total, page, hasMore }
```

#### 获取帖子详情
```
GET /api/posts/:postId
Response: { success, post: { ... , author: {...} } }
```

#### 点赞/取消点赞
```
POST /api/posts/like
Body: { postId, userId }
Response: { success, liked, count }
```

#### 收藏/取消收藏
```
POST /api/posts/collect
Body: { postId, userId }
Response: { success, collected, count }
```

#### 评论帖子
```
POST /api/posts/comment
Body: { postId, userId, content, replyTo }
Response: { success, message, comment }
```

### 图片上传

#### 上传图片
```
POST /api/upload/image
Content-Type: multipart/form-data
Body: FormData with image file
Response: { success, message, url, filename }
```

#### 上传头像
```
POST /api/upload/avatar
Content-Type: multipart/form-data
Body: FormData with avatar file
Response: { success, message, url, filename }
```

### 分区 / 轮播图 / 公告 / 活动

#### 获取轮播图
```
GET /api/carousel
Response: { success, carousel: [...] }
```

#### 管理员添加轮播图
```
POST /api/admin/carousel
Body: { key, title, imageUrl, link }
Response: { success, message }
```

#### 管理员删除轮播图
```
POST /api/admin/carousel/delete
Body: { key, id }
Response: { success, message }
```

#### 获取分区
```
GET /api/sections
Response: { success, sections: [...] }
```

#### 管理员添加分区
```
POST /api/admin/sections
Body: { key, name }
Response: { success, message, section }
```

#### 管理员删除分区
```
POST /api/admin/sections/delete
Body: { key, id }
Response: { success, message }
```

#### 获取公告
```
GET /api/announcements
Response: { success, announcements: [...] }
```

#### 获取活动
```
GET /api/activities
Response: { success, activities: [...] }
```

### 消息相关

#### 获取消息
```
GET /api/messages?userId=xxx&type=all
Response: { success, messages: [...] }
```

#### 标记已读
```
POST /api/messages/read
Body: { messageId }
Response: { success, message }
```

### 搜索

#### 搜索
```
GET /api/search?q=关键词&regex=false
Response: { success, posts: [...], users: [...] }
```

### 管理员

#### 验证密钥
```
POST /api/admin/verify
Body: { key }
Response: { success, verified }
```

#### 获取统计
```
GET /api/admin/stats?key=xxx
Response: { success, users, posts, comments, images }
```

#### 删除帖子
```
POST /api/admin/posts/delete
Body: { postId, key }
Response: { success, message }
```

---

## 管理员密钥

```
@nf.Control~$$410.J908dawDAwd98dajwd08AQWDF89898adwjikdfaadfw*AWdf87a8wdawdawidhihqeifiAWEFoawdfohoqhwefWQEFIowqejfoweofjowhefWEFJOWEFjhowefoijhjowWEFJFOWEHWEF
```

⚠️ **请妥善保管，不要泄露！**

---

## 常见问题

### Q1: 启动后无法访问？
1. 确认服务器正在运行（有"服务器已启动"提示）
2. 检查防火墙是否开放 3000 端口
3. 云服务器需在安全组中开放端口

### Q2: 图片上传失败？
1. 检查 `uploads/` 目录是否存在
2. 确认目录有写入权限
3. 检查图片格式（支持 jpg/png/gif/webp）

### Q3: 数据在哪里？
- 所有数据存储在 `data/` 目录的 JSON 文件中
- 图片存储在 `uploads/` 目录
- 定期备份这两个目录

### Q4: 如何修改端口？
编辑 `server/server.js` 第 7 行：
```javascript
const PORT = process.env.PORT || 3000;
```

### Q5: 忘记密码？
目前需要联系管理员在数据库中重置。

### Q6: 部署脚本乱码？
这是 Windows 批处理编码问题，不影响功能。如果脚本失败，请手动执行：
```powershell
cd server
node server.js
```

---

## 版本信息

- **当前版本**：2.0.0
- **发布年份**：2026
- **适用平台**：Windows 10 / Windows Server 2016+

---

## 更新日志

### v2.0.0 (2026)
- 完全重构为 Node.js 服务器架构
- 小红书风格瀑布流帖子
- 完整的社交功能（点赞/评论/收藏/关注）
- 消息通知系统
- 管理员后台
- 图片本地上传存储
- 移动端响应式适配
- 详细 API 文档

### v1.0.0
- 基础网站功能
- 用户注册登录
- 帖子发布查看
- 搜索功能
- 管理员面板