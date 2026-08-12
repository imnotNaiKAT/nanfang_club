/**
 * 楠芳·俱乐部 - 完整后端服务器
 * 支持图片上传、评论、点赞、收藏、关注、消息等所有功能
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;

// 目录设置
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const POSTS_DIR = path.join(UPLOADS_DIR, 'posts');

// 确保目录存在
[DATA_DIR, UPLOADS_DIR, IMAGES_DIR, AVATARS_DIR, POSTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// MIME类型
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed'
};

// 管理员密钥
const ADMIN_KEY = '@nf.Control~$$410.J908dawDAwd98dajwd08AQWDF89898adwjikdfaadfw*AWdf87a8wdawdawidhihqeifiAWEFoawdfohoqhwefWQEFIowqejfoweofjowhefWEFJOWEFjhowefoijhjowWEFJFOWEHWEF';

// 数据操作
const Database = {
    get: (key) => {
        try {
            const filePath = path.join(DATA_DIR, key + '.json');
            if (fs.existsSync(filePath)) {
                return JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
            return null;
        } catch (e) {
            return null;
        }
    },

    set: (key, data) => {
        try {
            const filePath = path.join(DATA_DIR, key + '.json');
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (e) {
            return false;
        }
    }
};

// 解析请求体
function parseBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            try {
                const body = Buffer.concat(chunks);
                // 检查是否是multipart/form-data
                const contentType = req.headers['content-type'] || '';
                if (contentType.includes('multipart/form-data')) {
                    resolve(parseMultipart(body, contentType));
                } else {
                    resolve(JSON.parse(body.toString()));
                }
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

// 解析multipart表单
function parseMultipart(body, contentType) {
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) return {};

    const result = { files: [], fields: {} };
    const parts = body.toString().split('--' + boundary);

    for (const part of parts) {
        if (part.includes('Content-Disposition')) {
            const nameMatch = part.match(/name="([^"]+)"/);
            const filenameMatch = part.match(/filename="([^"]+)"/);

            if (filenameMatch) {
                // 这是文件
                const headerEnd = part.indexOf('\r\n\r\n');
                if (headerEnd > -1) {
                    const content = part.substring(headerEnd + 4).trim();
                    const filename = filenameMatch[1];
                    const mimetypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/i);
                    const mimetype = mimetypeMatch ? mimetypeMatch[1] : 'application/octet-stream';

                    // 保存文件
                    const ext = path.extname(filename);
                    const newFilename = Date.now() + '_' + crypto.randomBytes(4).toString('hex') + ext;
                    const filepath = path.join(POSTS_DIR, newFilename);

                    // 只保存base64部分
                    const base64Data = content.replace(/--$/, '').trim();
                    const fileBuffer = Buffer.from(base64Data, 'binary');
                    fs.writeFileSync(filepath, fileBuffer);

                    result.files.push({
                        fieldname: nameMatch[1],
                        originalname: filename,
                        mimetype: mimetype,
                        filename: newFilename,
                        path: filepath,
                        url: '/uploads/posts/' + newFilename
                    });
                }
            } else if (nameMatch) {
                // 这是普通字段
                const headerEnd = part.indexOf('\r\n\r\n');
                if (headerEnd > -1) {
                    const value = part.substring(headerEnd + 4).trim().replace(/--$/, '').trim();
                    result.fields[nameMatch[1]] = value;
                }
            }
        }
    }

    return result;
}

// 发送JSON响应
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

// 发送静态文件
function sendFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            send404(res);
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000'
            });
            res.end(data);
        }
    });
}

// 404响应
function send404(res) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 - 页面不存在</h1>');
}

// 创建服务器
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://' + req.headers.host);
    const pathname = url.pathname;

    // 处理CORS预检
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // API路由
    if (pathname.startsWith('/api/')) {
        try {
            await handleAPI(req, res, url);
        } catch (e) {
            console.error('API错误:', e);
            sendJSON(res, 500, { error: '服务器内部错误' });
        }
        return;
    }

    // 上传文件访问
    if (pathname.startsWith('/uploads/')) {
        const filePath = path.join(ROOT_DIR, pathname);
        if (fs.existsSync(filePath)) {
            sendFile(res, filePath);
        } else {
            send404(res);
        }
        return;
    }

    // 静态文件
    let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);

    // 目录访问
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    if (fs.existsSync(filePath)) {
        sendFile(res, filePath);
    } else {
        send404(res);
    }
});

// API处理
async function handleAPI(req, res, url) {
    const pathname = url.pathname;
    const method = req.method;

    // 用户注册
    if (pathname === '/api/users/register' && method === 'POST') {
        const body = await parseBody(req);
        const { qq, nickname, grade, password, gender } = body;

        if (!qq || !nickname || !grade || !password) {
            return sendJSON(res, 400, { error: '请填写完整信息' });
        }

        const users = Database.get('users') || [];

        // 检查QQ是否已注册
        if (users.find(u => u.qq === qq)) {
            return sendJSON(res, 400, { error: '该QQ号已注册' });
        }

        // 创建用户
        const newUser = {
            id: 'user_' + Date.now(),
            qq: qq,
            nickname: nickname,
            grade: grade,
            password: password, // 实际应加密
            gender: gender || '',
            avatar: '',
            bio: '',
            following: [],
            followers: [],
            collections: [],
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        Database.set('users', users);

        // 返回用户信息（不含密码）
        const userInfo = { ...newUser };
        delete userInfo.password;

        return sendJSON(res, 200, { message: '注册成功', user: userInfo });
    }

    // 用户登录
    if (pathname === '/api/users/login' && method === 'POST') {
        const body = await parseBody(req);
        const { qq, password } = body;

        const users = Database.get('users') || [];
        const user = users.find(u => u.qq === qq && u.password === password);

        if (!user) {
            return sendJSON(res, 401, { error: 'QQ号或密码错误' });
        }

        const userInfo = { ...user };
        delete userInfo.password;

        return sendJSON(res, 200, { message: '登录成功', user: userInfo });
    }

    // 获取用户信息
    if (pathname.startsWith('/api/users/') && method === 'GET') {
        const userId = pathname.split('/')[3];
        const users = Database.get('users') || [];
        const user = users.find(u => u.id === userId);

        if (!user) {
            return sendJSON(res, 404, { error: '用户不存在' });
        }

        const userInfo = { ...user };
        delete userInfo.password;

        return sendJSON(res, 200, userInfo);
    }

    // 更新用户信息
    if (pathname === '/api/users/update' && method === 'POST') {
        const body = await parseBody(req);
        const { userId, nickname, gender, bio, avatar, password } = body;

        const users = Database.get('users') || [];
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return sendJSON(res, 404, { error: '用户不存在' });
        }

        if (nickname) users[userIndex].nickname = nickname;
        if (gender) users[userIndex].gender = gender;
        if (bio !== undefined) users[userIndex].bio = bio;
        if (avatar) users[userIndex].avatar = avatar;
        if (password) users[userIndex].password = password;

        Database.set('users', users);

        const userInfo = { ...users[userIndex] };
        delete userInfo.password;

        return sendJSON(res, 200, { message: '更新成功', user: userInfo });
    }

    // 发布帖子
    if (pathname === '/api/posts/create' && method === 'POST') {
        const body = await parseBody(req);
        let title, content, authorId, images;

        // 处理文件上传或普通JSON
        if (body.files) {
            title = body.fields.title;
            content = body.fields.content;
            authorId = body.fields.authorId;
            images = body.files.map(f => f.url);
        } else {
            title = body.title;
            content = body.content;
            authorId = body.authorId;
            images = body.images || [];
        }

        if (!title || !content || !authorId) {
            return sendJSON(res, 400, { error: '请填写完整信息' });
        }

        const posts = Database.get('posts') || [];

        const newPost = {
            id: 'post_' + Date.now(),
            title: title,
            content: content,
            authorId: authorId,
            images: images,
            likes: [],
            collects: [],
            comments: [],
            views: 0,
            createdAt: new Date().toISOString()
        };

        posts.unshift(newPost);
        Database.set('posts', posts);

        return sendJSON(res, 200, { message: '发布成功', post: newPost });
    }

    // 获取帖子列表
    if (pathname === '/api/posts' && method === 'GET') {
        const posts = Database.get('posts') || [];
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;

        const start = (page - 1) * limit;
        const end = start + limit;

        const paginatedPosts = posts.slice(start, end);
        const users = Database.get('users') || [];

        // 添加作者信息
        const postsWithAuthor = paginatedPosts.map(post => {
            const author = users.find(u => u.id === post.authorId);
            return {
                ...post,
                author: author ? {
                    id: author.id,
                    nickname: author.nickname,
                    avatar: author.avatar
                } : null
            };
        });

        return sendJSON(res, 200, {
            posts: postsWithAuthor,
            total: posts.length,
            page: page,
            hasMore: end < posts.length
        });
    }

    // 获取帖子详情
    if (pathname.startsWith('/api/posts/') && method === 'GET') {
        const postId = pathname.split('/')[3];
        const posts = Database.get('posts') || [];
        const post = posts.find(p => p.id === postId);

        if (!post) {
            return sendJSON(res, 404, { error: '帖子不存在' });
        }

        // 增加浏览量
        post.views = (post.views || 0) + 1;
        Database.set('posts', posts);

        const users = Database.get('users') || [];
        const author = users.find(u => u.id === post.authorId);

        const postWithAuthor = {
            ...post,
            author: author ? {
                id: author.id,
                nickname: author.nickname,
                avatar: author.avatar,
                grade: author.grade
            } : null
        };

        return sendJSON(res, 200, postWithAuthor);
    }

    // 点赞/取消点赞
    if (pathname === '/api/posts/like' && method === 'POST') {
        const body = await parseBody(req);
        const { postId, userId } = body;

        const posts = Database.get('posts') || [];
        const post = posts.find(p => p.id === postId);

        if (!post) {
            return sendJSON(res, 404, { error: '帖子不存在' });
        }

        if (!post.likes) post.likes = [];

        const index = post.likes.indexOf(userId);
        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }

        Database.set('posts', posts);

        return sendJSON(res, 200, { liked: index === -1, count: post.likes.length });
    }

    // 收藏/取消收藏
    if (pathname === '/api/posts/collect' && method === 'POST') {
        const body = await parseBody(req);
        const { postId, userId } = body;

        const posts = Database.get('posts') || [];
        const post = posts.find(p => p.id === postId);

        if (!post) {
            return sendJSON(res, 404, { error: '帖子不存在' });
        }

        if (!post.collects) post.collects = [];

        const index = post.collects.indexOf(userId);
        if (index === -1) {
            post.collects.push(userId);
        } else {
            post.collects.splice(index, 1);
        }

        Database.set('posts', posts);

        return sendJSON(res, 200, { collected: index === -1, count: post.collects.length });
    }

    // 评论帖子
    if (pathname === '/api/posts/comment' && method === 'POST') {
        const body = await parseBody(req);
        const { postId, userId, content, replyTo } = body;

        if (!content) {
            return sendJSON(res, 400, { error: '评论内容不能为空' });
        }

        const posts = Database.get('posts') || [];
        const post = posts.find(p => p.id === postId);

        if (!post) {
            return sendJSON(res, 404, { error: '帖子不存在' });
        }

        if (!post.comments) post.comments = [];

        const newComment = {
            id: 'comment_' + Date.now(),
            userId: userId,
            content: content,
            likes: [],
            replies: [],
            createdAt: new Date().toISOString()
        };

        if (replyTo) {
            // 回复评论
            const comment = post.comments.find(c => c.id === replyTo);
            if (comment) {
                if (!comment.replies) comment.replies = [];
                comment.replies.push({
                    id: 'reply_' + Date.now(),
                    userId: userId,
                    content: content,
                    createdAt: new Date().toISOString()
                });
            }
        } else {
            post.comments.unshift(newComment);
        }

        Database.set('posts', posts);

        return sendJSON(res, 200, { message: '评论成功', comment: newComment });
    }

    // 关注/取消关注
    if (pathname === '/api/users/follow' && method === 'POST') {
        const body = await parseBody(req);
        const { userId, targetId } = body;

        const users = Database.get('users') || [];
        const user = users.find(u => u.id === userId);
        const target = users.find(u => u.id === targetId);

        if (!user || !target) {
            return sendJSON(res, 404, { error: '用户不存在' });
        }

        if (!user.following) user.following = [];
        if (!target.followers) target.followers = [];

        const index = user.following.indexOf(targetId);
        if (index === -1) {
            user.following.push(targetId);
            target.followers.push(userId);
        } else {
            user.following.splice(index, 1);
            target.followers = target.followers.filter(id => id !== userId);
        }

        Database.set('users', users);

        return sendJSON(res, 200, { following: index === -1 });
    }

    // 发送消息
    if (pathname === '/api/messages/send' && method === 'POST') {
        const body = await parseBody(req);
        const { fromUserId, toUserId, type, content, postId } = body;

        const messages = Database.get('messages') || [];

        const newMessage = {
            id: 'msg_' + Date.now(),
            fromUserId: fromUserId,
            toUserId: toUserId,
            type: type,
            content: content,
            postId: postId,
            read: false,
            createdAt: new Date().toISOString()
        };

        messages.push(newMessage);
        Database.set('messages', messages);

        return sendJSON(res, 200, { message: '发送成功' });
    }

    // 获取消息
    if (pathname === '/api/messages' && method === 'GET') {
        const userId = url.searchParams.get('userId');
        const type = url.searchParams.get('type');

        let messages = Database.get('messages') || [];

        // 筛选用户消息
        messages = messages.filter(m => m.toUserId === userId);

        // 按类型筛选
        if (type && type !== 'all') {
            messages = messages.filter(m => m.type === type);
        }

        // 按时间排序
        messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return sendJSON(res, 200, messages);
    }

    // 标记消息已读
    if (pathname === '/api/messages/read' && method === 'POST') {
        const body = await parseBody(req);
        const { messageId } = body;

        const messages = Database.get('messages') || [];
        const message = messages.find(m => m.id === messageId);

        if (message) {
            message.read = true;
            Database.set('messages', messages);
        }

        return sendJSON(res, 200, { message: '已标记为已读' });
    }

    // 搜索
    if (pathname === '/api/search' && method === 'GET') {
        const query = url.searchParams.get('q') || '';
        const useRegex = url.searchParams.get('regex') === 'true';

        const posts = Database.get('posts') || [];
        const users = Database.get('users') || [];

        let matchedPosts = [];
        let matchedUsers = [];

        try {
            if (useRegex) {
                const regex = new RegExp(query, 'i');
                matchedPosts = posts.filter(p => regex.test(p.title) || regex.test(p.content));
                matchedUsers = users.filter(u => regex.test(u.nickname) || regex.test(u.bio));
            } else {
                const lowerQuery = query.toLowerCase();
                matchedPosts = posts.filter(p =>
                    p.title.toLowerCase().includes(lowerQuery) ||
                    p.content.toLowerCase().includes(lowerQuery)
                );
                matchedUsers = users.filter(u =>
                    u.nickname.toLowerCase().includes(lowerQuery) ||
                    (u.bio && u.bio.toLowerCase().includes(lowerQuery))
                );
            }
        } catch (e) {
            matchedPosts = [];
            matchedUsers = [];
        }

        return sendJSON(res, 200, {
            posts: matchedPosts.slice(0, 20),
            users: matchedUsers.slice(0, 10)
        });
    }

    // 管理员验证
    if (pathname === '/api/admin/verify' && method === 'POST') {
        const body = await parseBody(req);
        const { key } = body;

        if (key === ADMIN_KEY) {
            return sendJSON(res, 200, { verified: true });
        } else {
            return sendJSON(res, 401, { verified: false, error: '密钥错误' });
        }
    }

    // 管理员操作
    if (pathname === '/api/admin/posts/delete' && method === 'POST') {
        const body = await parseBody(req);
        const { postId, key } = body;

        if (key !== ADMIN_KEY) {
            return sendJSON(res, 401, { error: '未授权' });
        }

        const posts = Database.get('posts') || [];
        const index = posts.findIndex(p => p.id === postId);

        if (index !== -1) {
            posts.splice(index, 1);
            Database.set('posts', posts);
        }

        return sendJSON(res, 200, { message: '删除成功' });
    }

    // 初始化数据
    if (pathname === '/api/init' && method === 'GET') {
        if (!Database.get('users')) {
            Database.set('users', []);
        }
        if (!Database.get('posts')) {
            Database.set('posts', []);
        }
        if (!Database.get('messages')) {
            Database.set('messages', []);
        }
        if (!Database.get('announcements')) {
            Database.set('announcements', []);
        }
        if (!Database.get('activities')) {
            Database.set('activities', []);
        }
        return sendJSON(res, 200, { message: '初始化完成' });
    }

    // 图片上传
    if (pathname === '/api/upload/image' && method === 'POST') {
        try {
            const contentType = req.headers['content-type'] || '';
            
            if (!contentType.includes('multipart/form-data')) {
                return sendJSON(res, 400, { error: '不支持的内容类型' });
            }

            const body = await parseBody(req);
            
            if (!body.files || body.files.length === 0) {
                return sendJSON(res, 400, { error: '没有上传文件' });
            }

            const file = body.files[0];
            
            return sendJSON(res, 200, {
                message: '上传成功',
                url: file.url,
                filename: file.filename
            });
        } catch (e) {
            console.error('图片上传错误:', e);
            return sendJSON(res, 500, { error: '上传失败' });
        }
    }

    // 头像上传
    if (pathname === '/api/upload/avatar' && method === 'POST') {
        try {
            const contentType = req.headers['content-type'] || '';
            
            if (!contentType.includes('multipart/form-data')) {
                return sendJSON(res, 400, { error: '不支持的内容类型' });
            }

            const body = await parseBody(req);
            
            if (!body.files || body.files.length === 0) {
                return sendJSON(res, 400, { error: '没有上传文件' });
            }

            const file = body.files[0];
            
            return sendJSON(res, 200, {
                message: '上传成功',
                url: file.url,
                filename: file.filename
            });
        } catch (e) {
            console.error('头像上传错误:', e);
            return sendJSON(res, 500, { error: '上传失败' });
        }
    }

    // 未知API
    sendJSON(res, 404, { error: 'API不存在' });
}

// 启动服务器
server.listen(PORT, () => {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║              楠芳·俱乐部 - 服务器已启动                   ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║  访问地址: http://localhost:' + PORT);
    console.log('║  数据目录: ' + DATA_DIR);
    console.log('║  上传目录: ' + UPLOADS_DIR);
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\n');

    // 初始化数据
    http.get('http://localhost:' + PORT + '/api/init', () => {});
});