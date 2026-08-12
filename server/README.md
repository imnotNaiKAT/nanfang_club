# 楠芳·俱乐部 - 后端服务器

## 简介

这是一个可选的Node.js后端服务器，用于生产环境部署。如果使用GitHub Pages，可以只使用前端静态文件，数据将存储在浏览器的localStorage中。

## 安装

```bash
cd server
npm install
```

## 运行

```bash
npm start
```

服务器将在 http://localhost:3000 启动

## 环境变量

可以通过环境变量配置服务器：

- `PORT` - 服务器端口（默认3000）
- `ADMIN_KEY` - 管理员密钥（建议在生产环境修改）

## API接口

### 用户相关

- `POST /api/users/register` - 注册用户
- `POST /api/users/login` - 用户登录
- `GET /api/users/:id` - 获取用户信息
- `PUT /api/users/:id` - 更新用户信息

### 帖子相关

- `GET /api/posts` - 获取帖子列表
- `POST /api/posts` - 发布帖子
- `DELETE /api/posts/:id` - 删除帖子

### 搜索

- `GET /api/search?q=关键词` - 搜索内容

### 管理员

- `POST /api/admin/verify` - 验证管理员密钥
- `POST /api/admin/carousel` - 添加轮播图
- `DELETE /api/admin/carousel/:index` - 删除轮播图
- `POST /api/admin/announcements` - 添加公告
- `POST /api/admin/activities` - 添加活动

## 数据存储

数据存储在 `data/` 目录下的JSON文件中：
- `users.json` - 用户数据
- `posts.json` - 帖子数据
- `announcements.json` - 公告数据
- `activities.json` - 活动数据
- `carousel.json` - 轮播图数据

## 部署建议

1. 使用环境变量设置管理员密钥
2. 配置反向代理（如Nginx）
3. 启用HTTPS
4. 定期备份数据目录