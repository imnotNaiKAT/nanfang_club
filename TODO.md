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

## 🗂️ 项目结构

```
nanfang_club/
├── CNAME                    # 域名配置（请勿修改）
├── index.html               # 主页
├── posts.html               # 帖子页
├── search.html              # 搜索页
├── settings.html            # 设置页
├── about.html               # 关于页
├── user.html                # 用户主页
├── post-detail.html         # 帖子详情页
├── assets/
│   ├── css/
│   │   ├── main.css         # 主样式
│   │   ├── themes.css       # 主题样式
│   │   └── components.css   # 组件样式
│   ├── js/
│   │   ├── app.js           # 主应用逻辑
│   │   ├── auth.js          # 用户认证
│   │   ├── posts.js         # 帖子功能
│   │   ├── search.js        # 搜索功能
│   │   ├── admin.js         # 管理员功能
│   │   └── storage.js       # 数据存储
│   └── images/
│       ├── logo.png         # Logo（需您添加）
│       ├── default_avatar.png # 默认头像（需您添加）
│       ├── carousel/        # 轮播图片（需您添加）
│       └── banners/         # 横幅图片（需您添加）
├── server/                  # 后端服务（可选）
│   └── server.js            # Node.js 服务器
└── TODO.md                  # 本文档
```

---

## 🔧 功能说明

### 用户系统
- 注册需要：QQ号、昵称、届数、密码
- 登录需要：QQ号 + 密码
- 可设置：性别、头像、简介

### 帖子系统
- 支持文本、图片、文件上传
- 支持 Markdown 格式
- 类似小红书的卡片式展示

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

---

## 📝 数据管理

当前版本使用浏览器 localStorage 存储数据（演示用）。
如需正式部署，建议使用后端数据库。

数据存储位置：
- 用户数据: `localStorage.users`
- 帖子数据: `localStorage.posts`
- 设置数据: `localStorage.settings`

---

## ⚠️ 注意事项

1. **请勿修改 CNAME 文件**
2. 所有图片资源需您自行添加
3. 管理员密钥请妥善保管
4. 建议使用现代浏览器（Chrome/Edge/Firefox）

---

## 🚀 部署说明

### GitHub Pages 部署
1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择分支和根目录
4. 等待部署完成

### 本地测试
直接在浏览器中打开 `index.html` 即可测试

---

如有问题，请检查浏览器控制台是否有错误信息。
