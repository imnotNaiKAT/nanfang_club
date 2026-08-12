# 🚀 楠芳·俱乐部 - 部署说明

## ⚡ 快速开始（推荐）

### 最简单的部署方式：

#### 1. 安装 Node.js
- 下载：https://nodejs.org/（选择 LTS 版本）
- 安装后重启命令行

#### 2. 部署项目
```
方式 A（推荐）：双击 deploy.bat（需管理员权限）
方式 B：双击 start.bat（无需管理员权限，首次需要手动安装依赖）
```

#### 3. 访问网站
```
http://localhost:3000
```

**就是这么简单！**

---

## 📋 系统概述

楠芳·俱乐部是一个模仿小红书的社区网站，专为株洲市南方中学打造。

### ✨ 主要功能

#### 1. 用户系统
- 用户注册（QQ号、昵称、年级、密码）
- 用户登录
- 个人信息管理（头像、简介、性别）
- 用户主页展示

#### 2. 帖子系统（完全模仿小红书）
- 瀑布流布局展示
- 发布帖子（文字、图片、标签）
- 帖子详情页
- 图片轮播展示
- 浏览量统计

#### 3. 社交功能
- ❤️ 点赞帖子
- ⭐ 收藏帖子
- 💬 评论帖子（支持多级回复）
- 👥 关注用户
- 📢 消息通知系统

#### 4. 消息系统
- 点赞通知
- 评论通知
- 关注通知
- 系统消息
- 未读消息提示

#### 5. 搜索功能
- 关键词搜索
- 正则表达式搜索
- 模糊匹配

#### 6. 管理员功能
- 安全密钥验证
- 删除帖子
- 发布公告和活动
- 管理轮播图

---

## 💻 一键部署（Windows 10/Windows Server）

### 方式一：自动部署（推荐）⭐

#### 步骤 1：安装 Node.js
**重要：** 在运行部署脚本前，请先手动安装 Node.js

1. 访问 https://nodejs.org/
2. 下载 **LTS 版本**（推荐 v18 或 v20）
3. 运行安装程序，按默认设置安装
4. 安装完成后，**重启命令行窗口**

#### 步骤 2：下载项目
将整个项目文件夹下载到服务器，例如：`C:\nanfang_club`

#### 步骤 3：运行部署脚本
1. 找到项目根目录下的 `deploy.bat` 文件
2. **右键点击** → 选择 **"以管理员身份运行"**
3. 等待自动安装完成（约 2-5 分钟）

**注意：** 如果脚本显示乱码或错误，这是编码问题，请按照以下步骤操作：
- 确保已安装 Node.js（运行 `node -v` 检查）
- 如果脚本失败，直接双击 `start.bat` 启动服务器

#### 步骤 4：访问网站
部署完成后，脚本会自动打开浏览器访问：
```
http://localhost:3000
```

#### 部署脚本会自动完成：
- ✅ 检测 Node.js 是否已安装
- ✅ 创建必要的数据目录
- ✅ 安装项目依赖
- ✅ 配置防火墙规则
- ✅ 启动服务器
- ✅ 打开浏览器

---

### 方式二：手动部署

#### 步骤 1：安装 Node.js
1. 访问 https://nodejs.org/
2. 下载 LTS 版本（v18+ 或 v20+）
3. 运行安装程序，按默认设置安装

#### 步骤 2：进入项目目录
打开 PowerShell 或 CMD：
```powershell
cd C:\nanfang_club\server
```

#### 步骤 3：安装依赖
```powershell
npm install
```

#### 步骤 4：启动服务器
```powershell
node server.js
```

#### 步骤 5：访问网站
打开浏览器访问：
```
http://localhost:3000
```

---

## 🌐 局域网访问配置

### 1. 获取服务器IP地址
在服务器上运行：
```powershell
ipconfig
```
找到 IPv4 地址，例如：`192.168.1.100`

### 2. 访问地址
其他设备可以通过以下地址访问：
```
http://192.168.1.100:3000
```

### 3. 防火墙设置
如果无法访问，需要添加防火墙入站规则：
```powershell
netsh advfirewall firewall add rule name="楠芳·俱乐部" dir=in action=allow protocol=tcp localport=3000
```

---

## 📁 项目结构

```
nanfang_club/
├── assets/                  # 静态资源
│   ├── css/                # 样式文件
│   │   ├── main.css        # 主样式
│   │   ├── themes.css      # 主题样式（亮色/暗色）
│   │   ├── components.css  # 组件样式
│   │   └── mobile.css      # 移动端样式
│   ├── js/                 # JavaScript文件
│   │   ├── app.js          # 应用主逻辑
│   │   ├── auth.js         # 用户认证
│   │   ├── storage.js      # 数据存储
│   │   ├── posts.js        # 帖子功能
│   │   ├── search.js       # 搜索功能
│   │   └── mobile.js       # 移动端功能
│   └── images/             # 图片资源
├── server/                  # 服务器端
│   ├── server.js           # Node.js 服务器
│   └── package.json        # 项目配置
├── data/                    # 数据目录（自动创建）
│   ├── users.json          # 用户数据
│   ├── posts.json          # 帖子数据
│   ├── messages.json       # 消息数据
│   ├── announcements.json  # 公告数据
│   └── activities.json     # 活动数据
├── uploads/                 # 上传文件目录（自动创建）
│   ├── images/             # 普通图片
│   ├── avatars/            # 用户头像
│   └── posts/              # 帖子图片
├── index.html              # 主页
├── posts.html              # 帖子列表页
├── post-detail.html        # 帖子详情页
├── create-post.html        # 发布帖子页
├── messages.html           # 消息页面
├── search.html             # 搜索页面
├── settings.html           # 设置页面
├── user.html               # 用户主页
├── about.html              # 关于页面
├── deploy.bat              # 一键部署脚本（需管理员权限）
├── start.bat               # 快速启动脚本
├── stop.bat                # 停止服务器脚本
├── DEPLOYMENT.md           # 部署说明文档（本文档）
└── CNAME                   # 域名配置（请勿修改）
```

---

## 🔧 API 接口文档

### 用户相关

#### 注册用户
```
POST /api/users/register
Body: { qq, nickname, grade, password, gender }
Response: { message, user }
```

#### 用户登录
```
POST /api/users/login
Body: { qq, password }
Response: { message, user }
```

#### 获取用户信息
```
GET /api/users/:userId
Response: { id, qq, nickname, grade, avatar, bio, ... }
```

#### 更新用户信息
```
POST /api/users/update
Body: { userId, nickname, gender, bio, avatar, password }
Response: { message, user }
```

#### 关注/取消关注
```
POST /api/users/follow
Body: { userId, targetId }
Response: { following: boolean }
```

### 帖子相关

#### 发布帖子
```
POST /api/posts/create
Body: { title, content, authorId, images, tags }
Response: { message, post }
```

#### 获取帖子列表
```
GET /api/posts?page=1&limit=20
Response: { posts: [], total, page, hasMore }
```

#### 获取帖子详情
```
GET /api/posts/:postId
Response: { id, title, content, author, likes, comments, ... }
```

#### 点赞/取消点赞
```
POST /api/posts/like
Body: { postId, userId }
Response: { liked: boolean, count: number }
```

#### 收藏/取消收藏
```
POST /api/posts/collect
Body: { postId, userId }
Response: { collected: boolean, count: number }
```

#### 评论帖子
```
POST /api/posts/comment
Body: { postId, userId, content, replyTo }
Response: { message, comment }
```

### 图片上传

#### 上传图片
```
POST /api/upload/image
Content-Type: multipart/form-data
Body: FormData with image file
Response: { message, url, filename }
```

#### 上传头像
```
POST /api/upload/avatar
Content-Type: multipart/form-data
Body: FormData with avatar file
Response: { message, url, filename }
```

### 消息相关

#### 发送消息
```
POST /api/messages/send
Body: { fromUserId, toUserId, type, content, postId }
Response: { message }
```

#### 获取消息
```
GET /api/messages?userId=xxx&type=all
Response: [ { id, fromUserId, type, content, read, ... } ]
```

#### 标记已读
```
POST /api/messages/read
Body: { messageId }
Response: { message }
```

### 搜索

#### 搜索内容
```
GET /api/search?q=关键词&regex=false
Response: { posts: [], users: [] }
```

### 管理员

#### 管理员验证
```
POST /api/admin/verify
Body: { key }
Response: { verified: boolean }
```

#### 删除帖子
```
POST /api/admin/posts/delete
Body: { postId, key }
Response: { message }
```

---

## 🔐 管理员密钥

```
@nf.Control~$$410.J908dawDAwd98dajwd08AQWDF89898adwjikdfaadfw*AWdf87a8wdawdawidhihqeifiAWEFoawdfohoqhwefWQEFIowqejfoweofjowhefWEFJOWEFjhowefoijhjowWEFJFOWEHWEF
```

⚠️ **请妥善保管此密钥，不要泄露给他人！**

---

## 📱 功能使用指南

### 1. 注册与登录

#### 注册账号：
1. 点击导航栏的"登录/注册"
2. 填写QQ号（仅用于判重）
3. 输入昵称
4. 选择年级
5. 设置密码
6. 点击"注册"

#### 登录账号：
1. 输入QQ号和密码
2. 点击"登录"

### 2. 发布帖子

1. 点击右下角的紫色 **"+"** 按钮
2. 添加图片（最多9张）
3. 输入标题（不超过50字）
4. 输入内容（支持Markdown）
5. 添加标签（可选，最多5个）
6. 点击"发布"

### 3. 互动功能

#### 点赞：
- 在帖子详情页点击底部的 ❤️ 图标

#### 收藏：
- 在帖子详情页点击底部的 ⭐ 图标

#### 评论：
- 在帖子详情页底部的输入框输入内容
- 按回车键发送
- 点击评论下方的"回复"可以回复该评论

#### 关注：
- 在帖子详情页点击作者旁边的"关注"按钮
- 或在用户主页点击"关注"

### 4. 消息通知

1. 点击导航栏的"消息"
2. 可以切换不同类型的消息：
   - 全部：所有消息
   - 点赞：收到的点赞
   - 评论：收到的评论
   - 关注：新的关注者
   - 系统：系统通知

### 5. 搜索功能

1. 点击导航栏的搜索框
2. 输入关键词
3. 按回车键搜索
4. 支持正则表达式搜索（在搜索结果页切换）

---

## 🎨 主题切换

网站支持亮色/暗色两种主题：

- 点击导航栏右侧的月亮图标 🌙 切换主题
- 主题设置会自动保存

---

## 🔧 常见问题

### Q1: 运行 deploy.bat 出现乱码？

**原因：** Windows 批处理文件的编码问题

**解决方案：**
1. 这是正常现象，不影响功能
2. 如果脚本执行失败，请按照以下步骤：
   ```powershell
   # 1. 确认 Node.js 已安装
   node -v

   # 2. 进入 server 目录
   cd server

   # 3. 安装依赖（首次运行）
   npm install

   # 4. 启动服务器
   node server.js
   ```
3. 或者直接双击 `start.bat` 启动服务器

### Q2: 部署后无法访问？

**解决方案：**
1. 检查 Node.js 是否正确安装：`node -v`
2. 检查服务器是否运行：查看是否有 "服务器已启动" 提示
3. 检查防火墙是否允许3000端口
4. 尝试重新运行 `deploy.bat` 或 `start.bat`

### Q3: 图片上传失败？

**解决方案：**
1. 检查 `uploads` 目录是否存在且有写入权限
2. 检查图片格式是否为 jpg/png/gif
3. 检查图片大小是否过大（建议 < 5MB）

### Q4: 数据丢失？

**解决方案：**
- 所有数据存储在 `data` 目录下的 JSON 文件中
- 定期备份 `data` 和 `uploads` 目录
- 不要手动修改 JSON 文件

### Q5: 忘记密码？

**解决方案：**
- 目前需要联系管理员重置
- 后续版本会添加找回密码功能

### Q6: 如何修改端口？

**解决方案：**
1. 打开 `server/server.js`
2. 修改第7行：`const PORT = process.env.PORT || 3000;`
3. 将 3000 改为你想要的端口
4. 重启服务器

---

## 📞 技术支持

如有问题，请：
1. 查看本文档的常见问题部分
2. 检查服务器日志输出
3. 联系项目维护者

---

## 📄 版本信息

- **当前版本：** 2.0.0
- **发布日期：** 2024
- **适用平台：** Windows 10 / Windows Server 2016+

---

## 📜 更新日志

### v2.0.0 (当前版本)
- ✨ 完全重构，模仿小红书界面
- ✨ 新增图片上传功能，本地存储
- ✨ 新增评论、点赞、收藏、关注功能
- ✨ 新增消息通知系统
- ✨ 新增发布帖子专用页面
- ✨ 新增瀑布流布局
- ✨ 新增无限滚动加载
- ✨ 改进移动端适配
- ✨ 改进用户界面设计
- ✨ 添加详细部署文档

### v1.0.0
- 基础网站功能
- 用户注册登录
- 帖子发布查看
- 搜索功能
- 管理员面板

---

## 📜 许可证

本项目仅供株洲市南方中学内部使用。

---

**祝您使用愉快！🎉**