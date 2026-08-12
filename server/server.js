/**
 * 楠芳·俱乐部 - Node.js 后端服务器
 * 用于生产环境部署，提供API接口和数据持久化
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

// 配置
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || '@nf.Control~$$410.J908dawDAwd98dajwd08AQWDF89898adwjikdfaadfw*AWdf87a8wdawdawidhihqeifiAWEFoawdfohoqhwefWQEFIowqejfoweofjowhefWEFJOWEFjhowefoijhjowWEFJFOWEHWEF';

// 数据目录
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// 确保目录存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// 数据存储
const db = {
    users: [],
    posts: [],
    announcements: [],
    activities: [],
    carousel: [],
    sections: ['announcements', 'activities']
};

// 加载数据
function loadData() {
    Object.keys(db).forEach(key => {
        const filePath = path.join(DATA_DIR, `${key}.json`);
        if (fs.existsSync(filePath)) {
            try {
                db[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (e) {
                console.error(`Error loading ${key}:`, e);
            }
        }
    });
}

// 保存数据
function saveData(key) {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(db[key], null, 2));
}

// 生成ID
function generateId() {
    return Date.now().toString(36) + crypto.randomBytes(4).toString('hex');
}

// 密码哈希
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// MIME类型
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// 解析请求体
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

// 发送JSON响应
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// 发送错误响应
function sendError(res, statusCode, message) {
    sendJson(res, statusCode, { error: message });
}

// API路由
const apiRoutes = {
    // 用户相关
    'POST /api/users/register': async (req, res) => {
        const body = await parseBody(req);
        const { qq, nickname, grade, password } = body;

        if (!qq || !nickname || !grade || !password) {
            return sendError(res, 400, '请填写完整信息');
        }

        if (db.users.find(u => u.qq === qq)) {
            return sendError(res, 400, '该QQ号已被注册');
        }

        const user = {
            id: generateId(),
            qq,
            nickname,
            grade,
            password: hashPassword(password),
            gender: '',
            avatar: '',
            bio: '',
            createdAt: Date.now()
        };

        db.users.push(user);
        saveData('users');

        sendJson(res, 201, { success: true, userId: user.id });
    },

    'POST /api/users/login': async (req, res) => {
        const body = await parseBody(req);
        const { qq, password } = body;

        const user = db.users.find(u => u.qq === qq);
        if (!user) {
            return sendError(res, 401, '账号不存在');
        }

        if (user.password !== hashPassword(password)) {
            return sendError(res, 401, '密码错误');
        }

        sendJson(res, 200, { success: true, userId: user.id, nickname: user.nickname });
    },

    'GET /api/users/:id': (req, res, params) => {
        const user = db.users.find(u => u.id === params.id);
        if (!user) {
            return sendError(res, 404, '用户不存在');
        }
        const { password, ...userInfo } = user;
        sendJson(res, 200, userInfo);
    },

    'PUT /api/users/:id': async (req, res, params) => {
        const userIndex = db.users.findIndex(u => u.id === params.id);
        if (userIndex === -1) {
            return sendError(res, 404, '用户不存在');
        }

        const body = await parseBody(req);
        const { nickname, gender, bio, avatar, password } = body;

        if (nickname) db.users[userIndex].nickname = nickname;
        if (gender) db.users[userIndex].gender = gender;
        if (bio) db.users[userIndex].bio = bio;
        if (avatar) db.users[userIndex].avatar = avatar;
        if (password) db.users[userIndex].password = hashPassword(password);

        saveData('users');
        sendJson(res, 200, { success: true });
    },

    // 帖子相关
    'GET /api/posts': (req, res) => {
        const posts = db.posts.map(post => {
            const author = db.users.find(u => u.id === post.authorId);
            return { ...post, author };
        });
        sendJson(res, 200, posts);
    },

    'POST /api/posts': async (req, res) => {
        const body = await parseBody(req);
        const { title, content, authorId, images, files } = body;

        if (!title || !content || !authorId) {
            return sendError(res, 400, '请填写完整信息');
        }

        const post = {
            id: generateId(),
            title,
            content,
            authorId,
            images: images || [],
            files: files || [],
            createdAt: Date.now()
        };

        db.posts.push(post);
        saveData('posts');

        sendJson(res, 201, { success: true, postId: post.id });
    },

    'DELETE /api/posts/:id': (req, res, params) => {
        const index = db.posts.findIndex(p => p.id === params.id);
        if (index === -1) {
            return sendError(res, 404, '帖子不存在');
        }

        db.posts.splice(index, 1);
        saveData('posts');
        sendJson(res, 200, { success: true });
    },

    // 搜索
    'GET /api/search': (req, res) => {
        const query = url.parse(req.url, true).query.q;
        if (!query) {
            return sendJson(res, 200, []);
        }

        const results = [];
        const searchQuery = query.toLowerCase();

        db.posts.forEach(post => {
            if (post.title.toLowerCase().includes(searchQuery) ||
                post.content.toLowerCase().includes(searchQuery)) {
                results.push({ type: 'post', ...post });
            }
        });

        db.users.forEach(user => {
            if (user.nickname.toLowerCase().includes(searchQuery) ||
                user.qq === searchQuery) {
                const { password, ...userInfo } = user;
                results.push({ type: 'user', ...userInfo });
            }
        });

        sendJson(res, 200, results);
    },

    // 管理员
    'POST /api/admin/verify': async (req, res) => {
        const body = await parseBody(req);
        if (body.key === ADMIN_KEY) {
            sendJson(res, 200, { success: true });
        } else {
            sendError(res, 401, '密钥错误');
        }
    },

    'POST /api/admin/carousel': async (req, res) => {
        const body = await parseBody(req);
        db.carousel.push(body.image);
        saveData('carousel');
        sendJson(res, 200, { success: true });
    },

    'DELETE /api/admin/carousel/:index': (req, res, params) => {
        db.carousel.splice(parseInt(params.index), 1);
        saveData('carousel');
        sendJson(res, 200, { success: true });
    },

    'POST /api/admin/announcements': async (req, res) => {
        const body = await parseBody(req);
        const announcement = {
            id: generateId(),
            ...body,
            createdAt: Date.now()
        };
        db.announcements.push(announcement);
        saveData('announcements');
        sendJson(res, 201, { success: true, id: announcement.id });
    },

    'POST /api/admin/activities': async (req, res) => {
        const body = await parseBody(req);
        const activity = {
            id: generateId(),
            ...body,
            createdAt: Date.now()
        };
        db.activities.push(activity);
        saveData('activities');
        sendJson(res, 201, { success: true, id: activity.id });
    }
};

// 创建服务器
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // API路由匹配
    for (const route of Object.keys(apiRoutes)) {
        const [method, pattern] = route.split(' ');
        const params = {};
        let match = false;

        if (req.method === method) {
            const patternParts = pattern.split('/');
            const pathParts = pathname.split('/');

            if (patternParts.length === pathParts.length) {
                match = patternParts.every((part, i) => {
                    if (part.startsWith(':')) {
                        params[part.slice(1)] = pathParts[i];
                        return true;
                    }
                    return part === pathParts[i];
                });
            }
        }

        if (match) {
            try {
                await apiRoutes[route](req, res, params);
            } catch (error) {
                console.error('API Error:', error);
                sendError(res, 500, '服务器错误');
            }
            return;
        }
    }

    // 静态文件服务
    let filePath = path.join(__dirname, '..', pathname === '/' ? 'index.html' : pathname);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 返回index.html用于前端路由
                fs.readFile(path.join(__dirname, '..', 'index.html'), (err2, data2) => {
                    if (err2) {
                        res.writeHead(500);
                        res.end('Server Error');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(data2);
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

// 启动服务器
loadData();
server.listen(PORT, () => {
    console.log(`\n🚀 楠芳·俱乐部服务器已启动`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`📁 静态文件目录: ${path.join(__dirname, '..')}`);
    console.log(`💾 数据目录: ${DATA_DIR}\n`);
});