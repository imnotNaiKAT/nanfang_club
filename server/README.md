# 楠芳·俱乐部 - 后端服务器

## 简介

楠芳·俱乐部的 Node.js 后端服务器，提供完整的 RESTful API 和静态文件服务。

本服务器是项目的**必需组件**，所有数据存储（用户、帖子、消息等）都通过服务器文件系统持久化保存。

## 特性

- 原生 Node.js http 模块，**零第三方依赖**
- RESTful API 接口
- JSON 文件持久化存储
- 图片上传与本地存储
- 用户认证（Session + SHA-256 密码哈希）
- 管理员权限验证
- CORS 跨域支持
- 静态文件服务

## 安装

```bash
cd server
npm install
```

## 运行

```bash
# 开发模式
node server.js

# 后台运行（Windows）
# 使用 start-server.bat 或 deploy.bat
```

服务器默认在 `http://localhost:3000` 启动

## 配置

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务器端口 | `3000` |
| `ADMIN_KEY` | 管理员密钥 | 内置默认密钥 |

### 端口修改

编辑 `server.js` 第 7 行：
```javascript
const PORT = process.env.PORT || 3000;
```

## API 接口

### 通用格式
```json
{ "success": true/false, ...data }
```

### 认证

受保护接口需在请求头携带：
```
Authorization: Bearer <sessionKey>
```

或通过查询参数：`?session=<sessionKey>`

### 用户

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/users/register` | 注册 |
| POST | `/api/users/login` | 登录（返回 sessionKey） |
| GET | `/api/users/:id` | 获取用户信息 |
| POST | `/api/users/update` | 更新用户信息 |
| POST | `/api/users/follow` | 关注/取消关注 |

### 帖子

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 帖子列表（支持分页、按作者/板块筛选） |
| GET | `/api/posts/:id` | 帖子详情 |
| POST | `/api/posts/create` | 发布帖子 |
| POST | `/api/posts/like` | 点赞/取消点赞 |
| POST | `/api/posts/collect` | 收藏/取消收藏 |
| POST | `/api/posts/comment` | 发表评论 |

### 图片上传

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/upload/image` | 上传图片（multipart/form-data） |
| POST | `/api/upload/avatar` | 上传头像（multipart/form-data） |

### 内容管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/carousel` | 获取轮播图列表 |
| GET | `/api/sections` | 获取分区列表 |
| GET | `/api/announcements` | 获取公告列表 |
| GET | `/api/activities` | 获取活动列表 |

### 消息

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/messages` | 获取消息列表 |
| POST | `/api/messages/read` | 标记已读 |

### 搜索

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/search?q=关键词&regex=false` | 搜索 |

### 管理员

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/verify` | 验证密钥 |
| GET | `/api/admin/stats?key=xxx` | 获取统计数据 |
| POST | `/api/admin/posts/delete` | 删除帖子 |
| POST | `/api/admin/carousel` | 添加轮播图 |
| POST | `/api/admin/carousel/delete` | 删除轮播图 |
| POST | `/api/admin/sections` | 添加分区 |
| POST | `/api/admin/sections/delete` | 删除分区 |

## 数据存储

数据存储在项目根目录的 `data/` 文件夹中：

| 文件 | 说明 |
|------|------|
| `users.json` | 用户数据（含密码哈希） |
| `posts.json` | 帖子数据 |
| `messages.json` | 消息数据 |
| `carousel.json` | 轮播图配置 |
| `sections.json` | 自定义分区 |
| `announcements.json` | 公告 |
| `activities.json` | 活动 |

上传文件存储在 `uploads/` 目录：
- `uploads/images/` — 普通图片
- `uploads/avatars/` — 用户头像
- `uploads/posts/` — 帖子图片

## 架构说明

```
客户端（浏览器）
    ↓ HTTP / RESTful API
Node.js HTTP Server (server.js)
    ↓
文件系统 (JSON + uploads/)
```

- 密码使用 SHA-256 + 随机 salt 哈希存储
- Session 基于内存（key-value 映射），服务器重启后失效
- 所有静态文件（HTML/CSS/JS）由同一服务器提供
- 图片通过 `/uploads/` 路径访问

## 部署建议

1. 使用 `pm2` 或 Windows 服务保持后台运行
2. 配置 Nginx 反向代理 + HTTPS
3. 定期备份 `data/` 和 `uploads/` 目录
4. 修改默认管理员密钥

## 许可证

本项目仅供株洲市南方中学内部使用。