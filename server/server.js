const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;

const ROOT_DIR = path.resolve(path.join(__dirname, '..'));
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const POSTS_DIR = path.join(UPLOADS_DIR, 'posts');

[DATA_DIR, UPLOADS_DIR, IMAGES_DIR, AVATARS_DIR, POSTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

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
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

const ADMIN_KEY = '@nf.Control~$$410.J908dawDAwd98dajwd08AQWDF89898adwjikdfaadfw*AWdf87a8wdawdawidhihqeifiAWEFoawdfohoqhwefWQEFIowqejfoweofjowhefWEFJOWEFjhowefoijhjowWEFJFOWEHWEF';

const sessions = {};

function hashPassword(password, salt) {
    if (!salt) salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
    return 'sha256:' + salt + ':' + hash;
}

function verifyPassword(password, stored) {
    if (!stored) return false;
    const parts = stored.split(':');
    if (parts.length === 3 && parts[0] === 'sha256') {
        const hash = crypto.createHash('sha256').update(password + parts[1]).digest('hex');
        return hash === parts[2];
    }
    return password === stored;
}

const DB = {
    get(key) {
        try {
            const fp = path.join(DATA_DIR, key + '.json');
            if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf8'));
            return null;
        } catch (e) { return null; }
    },
    set(key, data) {
        try {
            const fp = path.join(DATA_DIR, key + '.json');
            fs.writeFileSync(fp, JSON.stringify(data, null, 2));
            return true;
        } catch (e) { return false; }
    }
};

function makeSession(userId) {
    const key = crypto.randomBytes(32).toString('hex');
    sessions[key] = { userId, createdAt: Date.now() };
    return key;
}

function resolveSession(req) {
    const auth = req.headers['authorization'] || '';
    if (auth.startsWith('Bearer ')) {
        const key = auth.substring(7);
        const s = sessions[key];
        if (s) return s.userId;
    }
    const url = new URL(req.url, 'http://' + req.headers.host);
    const sk = url.searchParams.get('session');
    if (sk && sessions[sk]) return sessions[sk].userId;
    return null;
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            try {
                const body = Buffer.concat(chunks);
                const ct = req.headers['content-type'] || '';
                if (ct.includes('multipart/form-data')) {
                    resolve(parseMultipart(body, ct));
                } else {
                    resolve(JSON.parse(body.toString()));
                }
            } catch (e) { resolve({}); }
        });
        req.on('error', reject);
    });
}

function parseMultipart(body, contentType) {
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) return { files: [], fields: {} };
    const result = { files: [], fields: {} };
    const bodyStr = body.toString('binary');
    const parts = bodyStr.split('--' + boundary);

    for (const part of parts) {
        if (part.includes('Content-Disposition')) {
            const nameMatch = part.match(/name="([^"]+)"/);
            const filenameMatch = part.match(/filename="([^"]*)"/);
            const headerEnd = part.indexOf('\r\n\r\n');

            if (headerEnd === -1) continue;

            if (filenameMatch && filenameMatch[1]) {
                const mimetypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/i);
                const mimetype = mimetypeMatch ? mimetypeMatch[1].trim() : 'application/octet-stream';
                const fileContent = Buffer.from(part.substring(headerEnd + 4), 'binary');

                const ext = path.extname(filenameMatch[1]) || '.png';
                const newFilename = Date.now() + '_' + crypto.randomBytes(4).toString('hex') + ext;
                const filepath = path.join(IMAGES_DIR, newFilename);

                fs.writeFileSync(filepath, fileContent);

                result.files.push({
                    fieldname: nameMatch[1],
                    originalname: filenameMatch[1],
                    mimetype: mimetype,
                    filename: newFilename,
                    url: '/uploads/images/' + newFilename
                });
            } else if (nameMatch) {
                const value = part.substring(headerEnd + 4).replace(/--$/, '').trim();
                result.fields[nameMatch[1]] = value;
            }
        }
    }
    return result;
}

function sendJSON(res, code, data) {
    const resp = { success: code >= 200 && code < 300, ...data };
    res.writeHead(code, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(resp));
}

function sendFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const ct = MIME_TYPES[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - Page Not Found</h1>');
        } else {
            res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'public, max-age=3600' });
            res.end(data);
        }
    });
}

function getStaticFile(filePath) {
    try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return filePath;
    } catch (e) {}
    return null;
}

function getUserById(id) {
    const users = DB.get('users') || [];
    return users.find(u => u.id === id);
}

function stripPassword(user) {
    if (!user) return null;
    const info = { ...user };
    delete info.password;
    return info;
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://' + req.headers.host);
    const pn = url.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    try {
        if (pn.startsWith('/api/')) { await handleAPI(req, res, url); return; }
        if (pn.startsWith('/uploads/')) {
            const fp = path.join(ROOT_DIR, pn);
            const f = getStaticFile(fp);
            if (f) { sendFile(res, f); return; }
            res.writeHead(404); res.end('Not found'); return;
        }

        let relPath = pn === '/' ? '/index.html' : pn;
        let filePath = path.join(ROOT_DIR, relPath);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        let f = getStaticFile(filePath);
        if (f) { sendFile(res, f); return; }

        if (!path.extname(filePath)) {
            const altPath = filePath + '.html';
            f = getStaticFile(altPath);
            if (f) { sendFile(res, f); return; }
        }

        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Page Not Found</h1>');
    } catch (e) {
        console.error('Server error:', e);
        res.writeHead(500); res.end('Internal Server Error');
    }
});

async function handleAPI(req, res, url) {
    const pn = url.pathname;
    const method = req.method;
    const userId = resolveSession(req);

    if (pn === '/api/init' && method === 'GET') {
        ['users', 'posts', 'messages', 'announcements', 'activities', 'carousel', 'sections', 'sectionNames'].forEach(k => {
            if (!DB.get(k)) DB.set(k, k === 'sectionNames' ? {} : []);
        });
        return sendJSON(res, 200, { message: 'initialized' });
    }

    if (pn === '/api/users/register' && method === 'POST') {
        const b = await parseBody(req);
        const { qq, nickname, grade, password, gender } = b;
        if (!qq || !nickname || !grade || !password) return sendJSON(res, 400, { error: '请填写完整信息' });
        const users = DB.get('users') || [];
        if (users.find(u => u.qq === qq)) return sendJSON(res, 400, { error: '该QQ号已注册' });
        const u = { id: 'user_' + Date.now(), qq, nickname, grade, password: hashPassword(password), gender: gender || '', avatar: '', bio: '', following: [], followers: [], collections: [], createdAt: new Date().toISOString() };
        users.push(u); DB.set('users', users);
        const sessionKey = makeSession(u.id);
        return sendJSON(res, 200, { message: '注册成功', user: stripPassword(u), sessionKey });
    }

    if (pn === '/api/users/login' && method === 'POST') {
        const b = await parseBody(req);
        const users = DB.get('users') || [];
        const u = users.find(x => x.qq === b.qq);
        if (!u || !verifyPassword(b.password, u.password)) return sendJSON(res, 401, { error: 'QQ号或密码错误' });
        if (!u.password.startsWith('sha256:')) {
            u.password = hashPassword(b.password);
            DB.set('users', users);
        }
        const sessionKey = makeSession(u.id);
        return sendJSON(res, 200, { message: '登录成功', user: stripPassword(u), sessionKey });
    }

    if (pn === '/api/users/logout' && method === 'POST') {
        const b = await parseBody(req);
        if (b.sessionKey && sessions[b.sessionKey]) delete sessions[b.sessionKey];
        return sendJSON(res, 200, { message: '已退出' });
    }

    if (pn === '/api/users/profile' && method === 'GET') {
        if (!userId) return sendJSON(res, 401, { error: '未登录' });
        const u = getUserById(userId);
        if (!u) return sendJSON(res, 404, { error: '用户不存在' });
        return sendJSON(res, 200, { user: stripPassword(u) });
    }

    if (pn.startsWith('/api/users/') && method === 'GET') {
        const uid = pn.split('/')[3];
        const u = getUserById(uid);
        if (!u) return sendJSON(res, 404, { error: '用户不存在' });
        return sendJSON(res, 200, { user: stripPassword(u) });
    }

    if (pn === '/api/users/update' && method === 'POST') {
        const b = await parseBody(req);
        if (!b.userId) b.userId = userId;
        if (!b.userId) return sendJSON(res, 401, { error: '未登录' });
        const users = DB.get('users') || [];
        const idx = users.findIndex(x => x.id === b.userId);
        if (idx === -1) return sendJSON(res, 404, { error: '用户不存在' });
        if (b.deleteAccount) {
            users.splice(idx, 1);
            DB.set('users', users);
            return sendJSON(res, 200, { message: '账号已注销' });
        }
        if (b.nickname) users[idx].nickname = b.nickname;
        if (b.gender !== undefined) users[idx].gender = b.gender;
        if (b.bio !== undefined) users[idx].bio = b.bio;
        if (b.avatar) users[idx].avatar = b.avatar;
        if (b.password) users[idx].password = hashPassword(b.password);
        DB.set('users', users);
        return sendJSON(res, 200, { message: '更新成功', user: stripPassword(users[idx]) });
    }

    if (pn === '/api/users/avatar' && method === 'POST') {
        const b = await parseBody(req);
        if (!userId) return sendJSON(res, 401, { error: '未登录' });
        const users = DB.get('users') || [];
        const idx = users.findIndex(x => x.id === userId);
        if (idx === -1) return sendJSON(res, 404, { error: '用户不存在' });
        if (b.avatar) {
            if (b.avatar.startsWith('data:image')) {
                const base64 = b.avatar.split(',')[1];
                const buf = Buffer.from(base64, 'base64');
                const extMatch = b.avatar.match(/data\/image\/(\w+)/);
                const ext = extMatch ? '.' + extMatch[1] : '.png';
                const fname = Date.now() + '_' + crypto.randomBytes(4).toString('hex') + ext;
                fs.writeFileSync(path.join(AVATARS_DIR, fname), buf);
                users[idx].avatar = '/uploads/avatars/' + fname;
            } else {
                users[idx].avatar = b.avatar;
            }
            DB.set('users', users);
        }
        return sendJSON(res, 200, { message: '更新成功', user: stripPassword(users[idx]) });
    }

    if (pn === '/api/users/follow' && method === 'POST') {
        const b = await parseBody(req);
        if (!userId) return sendJSON(res, 401, { error: '未登录' });
        const targetId = b.targetId || b.userId;
        if (!targetId) return sendJSON(res, 400, { error: '缺少目标用户ID' });
        const users = DB.get('users') || [];
        const user = users.find(u => u.id === userId);
        const target = users.find(u => u.id === targetId);
        if (!user || !target) return sendJSON(res, 404, { error: '用户不存在' });
        if (!user.following) user.following = [];
        if (!target.followers) target.followers = [];
        const idx = user.following.indexOf(targetId);
        if (idx === -1) { user.following.push(targetId); target.followers.push(userId); }
        else { user.following.splice(idx, 1); target.followers = target.followers.filter(id => id !== userId); }
        DB.set('users', users);
        return sendJSON(res, 200, { following: idx === -1 });
    }

    if (pn === '/api/users/stats' && method === 'GET') {
        const users = DB.get('users') || [];
        const posts = DB.get('posts') || [];
        let comments = 0;
        posts.forEach(p => { comments += (p.comments || []).length; });
        return sendJSON(res, 200, { users: users.length, posts: posts.length, comments });
    }

    if (pn === '/api/posts' && method === 'GET') {
        let posts = DB.get('posts') || [];
        const users = DB.get('users') || [];
        const authorId = url.searchParams.get('authorId');
        const section = url.searchParams.get('section');
        const limit = parseInt(url.searchParams.get('limit')) || 50;

        if (authorId) posts = posts.filter(p => p.authorId === authorId);
        if (section) posts = posts.filter(p => (p.section || '').toLowerCase() === section.toLowerCase());

        const sorted = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const result = sorted.slice(0, limit).map(p => {
            const a = users.find(u => u.id === p.authorId);
            return { ...p, author: a ? { id: a.id, nickname: a.nickname, avatar: a.avatar } : null };
        });
        return sendJSON(res, 200, { posts: result, total: posts.length });
    }

    if (pn.startsWith('/api/posts/') && method === 'GET') {
        const pid = pn.split('/')[3];
        const posts = DB.get('posts') || [];
        const post = posts.find(p => p.id === pid);
        if (!post) return sendJSON(res, 404, { error: '帖子不存在' });
        post.views = (post.views || 0) + 1;
        DB.set('posts', posts);
        const users = DB.get('users') || [];
        const a = users.find(u => u.id === post.authorId);
        const authorInfo = a ? { id: a.id, nickname: a.nickname, avatar: a.avatar, grade: a.grade } : null;

        const comments = (post.comments || []).map(c => {
            const cu = users.find(u => u.id === c.userId);
            return { ...c, user: cu ? { id: cu.id, nickname: cu.nickname, avatar: cu.avatar } : null };
        });

        return sendJSON(res, 200, { post: { ...post, author: authorInfo, comments } });
    }

    if (pn === '/api/posts/create' && method === 'POST') {
        const b = await parseBody(req);
        let title, content, authorId, images, tags, section;
        if (b.files) {
            title = b.fields.title; content = b.fields.content;
            authorId = b.fields.authorId || userId;
            images = (b.files || []).map(f => f.url);
            tags = b.fields.tags ? b.fields.tags.split(',').filter(Boolean) : [];
            section = b.fields.section || '';
        } else {
            title = b.title; content = b.content;
            authorId = b.authorId || userId;
            images = b.images || []; tags = b.tags || [];
            section = b.section || '';
        }
        if (!title || !content) return sendJSON(res, 400, { error: '请填写标题和内容' });
        if (!authorId) return sendJSON(res, 401, { error: '未登录' });
        const posts = DB.get('posts') || [];
        const p = {
            id: 'post_' + Date.now(),
            title, content, authorId, images, tags, section,
            likes: [], collects: [], comments: [], views: 0,
            createdAt: new Date().toISOString()
        };
        posts.unshift(p); DB.set('posts', posts);
        return sendJSON(res, 200, { message: '发布成功', post: p });
    }

    if (pn === '/api/posts/like' && method === 'POST') {
        const b = await parseBody(req);
        if (!userId) return sendJSON(res, 401, { error: '未登录' });
        const posts = DB.get('posts') || [];
        const i = posts.findIndex(p => p.id === b.postId);
        if (i === -1) return sendJSON(res, 404, { error: '帖子不存在' });
        if (!posts[i].likes) posts[i].likes = [];
        const idx = posts[i].likes.indexOf(userId);
        if (idx === -1) posts[i].likes.push(userId); else posts[i].likes.splice(idx, 1);
        DB.set('posts', posts);
        return sendJSON(res, 200, { liked: idx === -1, count: posts[i].likes.length, likes: posts[i].likes });
    }

    if (pn === '/api/posts/collect' && method === 'POST') {
        const b = await parseBody(req);
        if (!userId) return sendJSON(res, 401, { error: '未登录' });
        const posts = DB.get('posts') || [];
        const i = posts.findIndex(p => p.id === b.postId);
        if (i === -1) return sendJSON(res, 404, { error: '帖子不存在' });
        if (!posts[i].collects) posts[i].collects = [];
        const idx = posts[i].collects.indexOf(userId);
        if (idx === -1) posts[i].collects.push(userId); else posts[i].collects.splice(idx, 1);
        DB.set('posts', posts);
        return sendJSON(res, 200, { collected: idx === -1, count: posts[i].collects.length, collects: posts[i].collects });
    }

    if (pn === '/api/posts/comment' && method === 'POST') {
        const b = await parseBody(req);
        if (!userId) return sendJSON(res, 401, { error: '未登录' });
        if (!b.content) return sendJSON(res, 400, { error: '评论内容不能为空' });
        const posts = DB.get('posts') || [];
        const i = posts.findIndex(p => p.id === b.postId);
        if (i === -1) return sendJSON(res, 404, { error: '帖子不存在' });
        if (!posts[i].comments) posts[i].comments = [];
        const c = { id: 'comment_' + Date.now(), userId, content: b.content, likes: [], createdAt: new Date().toISOString() };
        if (b.replyTo) {
            const parent = posts[i].comments.find(x => x.id === b.replyTo);
            if (parent) {
                if (!parent.replies) parent.replies = [];
                parent.replies.push({ id: 'reply_' + Date.now(), userId, content: b.content, createdAt: new Date().toISOString() });
            } else {
                posts[i].comments.unshift(c);
            }
        } else {
            posts[i].comments.unshift(c);
        }
        DB.set('posts', posts);

        if (b.postId) {
            const msgs = DB.get('messages') || [];
            const post = posts.find(p => p.id === b.postId);
            if (post && post.authorId && post.authorId !== userId) {
                msgs.push({
                    id: 'msg_' + Date.now(),
                    fromUserId: userId,
                    toUserId: post.authorId,
                    type: 'comment',
                    content: b.content.substring(0, 100),
                    postId: b.postId,
                    read: false,
                    createdAt: new Date().toISOString()
                });
                DB.set('messages', msgs);
            }
        }

        return sendJSON(res, 200, { message: '评论成功', comment: c });
    }

    if (pn === '/api/posts/delete' && method === 'POST') {
        const b = await parseBody(req);
        const posts = DB.get('posts') || [];
        const i = posts.findIndex(p => p.id === b.postId);
        if (i !== -1) { posts.splice(i, 1); DB.set('posts', posts); }
        return sendJSON(res, 200, { message: '删除成功' });
    }

    if (pn === '/api/upload/image' && method === 'POST') {
        try {
            const b = await parseBody(req);
            if (!b.files || !b.files.length) return sendJSON(res, 400, { error: '没有上传文件' });
            return sendJSON(res, 200, { message: '上传成功', url: b.files[0].url });
        } catch (e) { return sendJSON(res, 500, { error: '上传失败' }); }
    }

    if (pn === '/api/upload/avatar' && method === 'POST') {
        try {
            const b = await parseBody(req);
            if (!b.files || !b.files.length) return sendJSON(res, 400, { error: '没有上传文件' });
            if (userId) {
                const users = DB.get('users') || [];
                const idx = users.findIndex(x => x.id === userId);
                if (idx !== -1) {
                    const fname = b.files[0].filename;
                    users[idx].avatar = '/uploads/images/' + fname;
                    DB.set('users', users);
                }
            }
            return sendJSON(res, 200, { message: '上传成功', url: b.files[0].url });
        } catch (e) { return sendJSON(res, 500, { error: '上传失败' }); }
    }

    if (pn === '/api/messages' && method === 'GET') {
        const uid = url.searchParams.get('userId') || userId;
        const type = url.searchParams.get('type');
        if (!uid) return sendJSON(res, 401, { error: '未登录' });
        let msgs = DB.get('messages') || [];
        msgs = msgs.filter(m => m.toUserId === uid);
        if (type && type !== 'all') msgs = msgs.filter(m => m.type === type);
        msgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const users = DB.get('users') || [];
        msgs = msgs.map(m => {
            const fu = users.find(u => u.id === m.fromUserId);
            return { ...m, fromUser: fu ? { id: fu.id, nickname: fu.nickname, avatar: fu.avatar } : null };
        });
        return sendJSON(res, 200, { messages: msgs });
    }

    if (pn === '/api/messages/send' && method === 'POST') {
        const b = await parseBody(req);
        const msgs = DB.get('messages') || [];
        msgs.push({
            id: 'msg_' + Date.now(),
            fromUserId: b.fromUserId || userId,
            toUserId: b.toUserId,
            type: b.type || 'system',
            content: b.content,
            postId: b.postId,
            read: false,
            createdAt: new Date().toISOString()
        });
        DB.set('messages', msgs);
        return sendJSON(res, 200, { message: '发送成功' });
    }

    if (pn === '/api/messages/read' && method === 'POST') {
        const b = await parseBody(req);
        const msgs = DB.get('messages') || [];
        const id = b.messageId || b.id;
        const m = msgs.find(x => x.id === id);
        if (m) { m.read = true; DB.set('messages', msgs); }
        return sendJSON(res, 200, { message: '已标记已读' });
    }

    if (pn === '/api/messages/unread' && method === 'GET') {
        const uid = url.searchParams.get('userId') || userId;
        if (!uid) return sendJSON(res, 401, { error: '未登录' });
        const msgs = DB.get('messages') || [];
        const unread = msgs.filter(m => m.toUserId === uid && !m.read);
        return sendJSON(res, 200, { count: unread.length });
    }

    if (pn === '/api/search' && method === 'GET') {
        const q = url.searchParams.get('q') || '';
        const regex = url.searchParams.get('regex') === 'true';
        const posts = DB.get('posts') || [];
        const users = DB.get('users') || [];
        const sections = DB.get('sections') || [];
        const sectionNames = DB.get('sectionNames') || {};
        let results = [];
        try {
            if (regex) {
                const re = new RegExp(q, 'i');
                posts.slice(0, 30).forEach(p => {
                    if (re.test(p.title) || re.test(p.content)) {
                        results.push({ type: 'post', id: p.id, title: p.title, content: p.content, authorId: p.authorId, createdAt: p.createdAt, author: (() => { const a = users.find(u => u.id === p.authorId); return a ? { nickname: a.nickname } : null; })() });
                    }
                });
                users.slice(0, 10).forEach(u => {
                    if (re.test(u.nickname) || (u.bio && re.test(u.bio))) {
                        results.push({ type: 'user', id: u.id, nickname: u.nickname, bio: u.bio });
                    }
                });
            } else {
                const lq = q.toLowerCase();
                posts.slice(0, 30).forEach(p => {
                    if (p.title.toLowerCase().includes(lq) || p.content.toLowerCase().includes(lq)) {
                        results.push({ type: 'post', id: p.id, title: p.title, content: p.content, authorId: p.authorId, createdAt: p.createdAt, author: (() => { const a = users.find(u => u.id === p.authorId); return a ? { nickname: a.nickname } : null; })() });
                    }
                });
                users.slice(0, 10).forEach(u => {
                    if (u.nickname.toLowerCase().includes(lq) || (u.bio && u.bio.toLowerCase().includes(lq))) {
                        results.push({ type: 'user', id: u.id, nickname: u.nickname, bio: u.bio });
                    }
                });
                sections.forEach(s => {
                    const name = sectionNames[s] || s;
                    if (name.toLowerCase().includes(lq)) {
                        results.push({ type: 'section', id: s, name });
                    }
                });
            }
        } catch (e) {}
        return sendJSON(res, 200, { results });
    }

    if (pn === '/api/sections' && method === 'GET') {
        const sections = DB.get('sections') || ['announcements', 'activities'];
        const sectionNames = DB.get('sectionNames') || {};
        const result = sections.map(s => ({ id: s, name: sectionNames[s] || s }));
        return sendJSON(res, 200, { sections: result });
    }

    if (pn === '/api/sections/add' && method === 'POST') {
        const b = await parseBody(req);
        const sections = DB.get('sections') || [];
        const sectionNames = DB.get('sectionNames') || {};
        const id = 'section_' + Date.now();
        sections.push(id);
        sectionNames[id] = b.name;
        DB.set('sections', sections);
        DB.set('sectionNames', sectionNames);
        return sendJSON(res, 200, { message: '添加成功', id });
    }

    if (pn === '/api/sections/update' && method === 'POST') {
        const b = await parseBody(req);
        const sectionNames = DB.get('sectionNames') || {};
        if (b.name) sectionNames[b.id] = b.name;
        if (b.icon) sectionNames[b.id + '_icon'] = b.icon;
        DB.set('sectionNames', sectionNames);
        return sendJSON(res, 200, { message: '更新成功' });
    }

    if (pn === '/api/sections/delete' && method === 'POST') {
        const b = await parseBody(req);
        const sections = DB.get('sections') || [];
        const newSections = sections.filter(s => s !== b.id);
        DB.set('sections', newSections);
        return sendJSON(res, 200, { message: '删除成功' });
    }

    if (pn === '/api/announcements' && method === 'GET') {
        const data = DB.get('announcements') || [];
        return sendJSON(res, 200, { announcements: data });
    }

    if (pn === '/api/announcements/add' && method === 'POST') {
        const b = await parseBody(req);
        const data = DB.get('announcements') || [];
        const item = { id: 'ann_' + Date.now(), title: b.title, content: b.content || '', link: b.link || '', createdAt: new Date().toISOString() };
        data.unshift(item);
        DB.set('announcements', data);
        return sendJSON(res, 200, { message: '添加成功', announcement: item });
    }

    if (pn === '/api/announcements/update' && method === 'POST') {
        const b = await parseBody(req);
        const data = DB.get('announcements') || [];
        const i = data.findIndex(x => x.id === b.id);
        if (i === -1) return sendJSON(res, 404, { error: '不存在' });
        if (b.title !== undefined) data[i].title = b.title;
        if (b.content !== undefined) data[i].content = b.content;
        if (b.link !== undefined) data[i].link = b.link;
        DB.set('announcements', data);
        return sendJSON(res, 200, { message: '更新成功' });
    }

    if (pn === '/api/announcements/delete' && method === 'POST') {
        const b = await parseBody(req);
        const data = DB.get('announcements') || [];
        const newData = data.filter(x => x.id !== b.id);
        DB.set('announcements', newData);
        return sendJSON(res, 200, { message: '删除成功' });
    }

    if (pn === '/api/activities' && method === 'GET') {
        const data = DB.get('activities') || [];
        return sendJSON(res, 200, { activities: data });
    }

    if (pn === '/api/activities/add' && method === 'POST') {
        const b = await parseBody(req);
        const data = DB.get('activities') || [];
        const item = { id: 'act_' + Date.now(), title: b.title, content: b.content || '', link: b.link || '', createdAt: new Date().toISOString() };
        data.unshift(item);
        DB.set('activities', data);
        return sendJSON(res, 200, { message: '添加成功', activity: item });
    }

    if (pn === '/api/activities/update' && method === 'POST') {
        const b = await parseBody(req);
        const data = DB.get('activities') || [];
        const i = data.findIndex(x => x.id === b.id);
        if (i === -1) return sendJSON(res, 404, { error: '不存在' });
        if (b.title !== undefined) data[i].title = b.title;
        if (b.content !== undefined) data[i].content = b.content;
        if (b.link !== undefined) data[i].link = b.link;
        DB.set('activities', data);
        return sendJSON(res, 200, { message: '更新成功' });
    }

    if (pn === '/api/activities/delete' && method === 'POST') {
        const b = await parseBody(req);
        const data = DB.get('activities') || [];
        const newData = data.filter(x => x.id !== b.id);
        DB.set('activities', newData);
        return sendJSON(res, 200, { message: '删除成功' });
    }

    if (pn === '/api/carousel' && method === 'GET') {
        const data = DB.get('carousel') || [];
        return sendJSON(res, 200, { carousel: data });
    }

    if (pn === '/api/carousel/add' && method === 'POST') {
        const b = await parseBody(req);
        const data = DB.get('carousel') || [];
        data.push({ id: 'carousel_' + Date.now(), title: b.title, image: b.image, link: b.link || '' });
        DB.set('carousel', data);
        return sendJSON(res, 200, { message: '添加成功' });
    }

    if (pn === '/api/carousel/delete' && method === 'POST') {
        const b = await parseBody(req);
        const data = DB.get('carousel') || [];
        const newData = data.filter(c => c.id !== b.id);
        DB.set('carousel', newData);
        return sendJSON(res, 200, { message: '删除成功' });
    }

    if (pn === '/api/carousel/update' && method === 'POST') {
        const b = await parseBody(req);
        const data = DB.get('carousel') || [];
        const i = data.findIndex(c => c.id === b.id);
        if (i !== -1) {
            if (b.title !== undefined) data[i].title = b.title;
            if (b.image !== undefined) data[i].image = b.image;
            if (b.link !== undefined) data[i].link = b.link;
            DB.set('carousel', data);
        }
        return sendJSON(res, 200, { message: '更新成功' });
    }

    if (pn === '/api/admin/verify' && method === 'POST') {
        const b = await parseBody(req);
        if (b.key === ADMIN_KEY) return sendJSON(res, 200, { verified: true });
        return sendJSON(res, 401, { verified: false, error: '密钥错误' });
    }

    if (pn === '/api/admin/stats' && method === 'GET') {
        const users = DB.get('users') || [];
        const posts = DB.get('posts') || [];
        let comments = 0;
        let images = 0;
        posts.forEach(p => {
            comments += (p.comments || []).length;
            images += (p.images || []).length;
        });
        const carousel = DB.get('carousel') || [];
        images += carousel.length;
        return sendJSON(res, 200, { users: users.length, posts: posts.length, comments, images });
    }

    if (pn === '/api/admin/users' && method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const users = DB.get('users') || [];
        const result = users.slice(0, limit).map(u => stripPassword(u));
        return sendJSON(res, 200, { users: result, total: users.length });
    }

    if (pn === '/api/admin/users/create' && method === 'POST') {
        const b = await parseBody(req);
        const users = DB.get('users') || [];
        if (users.find(u => u.qq === b.qq)) return sendJSON(res, 400, { error: '该QQ号已注册' });
        const u = { id: 'user_' + Date.now(), qq: b.qq, nickname: b.nickname, grade: b.grade, password: hashPassword(b.password), gender: b.gender || '', avatar: '', bio: '', following: [], followers: [], collections: [], createdAt: new Date().toISOString() };
        users.push(u); DB.set('users', users);
        return sendJSON(res, 200, { user: stripPassword(u) });
    }

    if (pn === '/api/admin/users/update' && method === 'POST') {
        const b = await parseBody(req);
        const users = DB.get('users') || [];
        const idx = users.findIndex(x => x.id === b.userId);
        if (idx === -1) return sendJSON(res, 404, { error: '用户不存在' });
        if (b.nickname) users[idx].nickname = b.nickname;
        if (b.gender !== undefined) users[idx].gender = b.gender;
        if (b.bio !== undefined) users[idx].bio = b.bio;
        if (b.avatar) users[idx].avatar = b.avatar;
        if (b.grade) users[idx].grade = b.grade;
        DB.set('users', users);
        return sendJSON(res, 200, { user: stripPassword(users[idx]) });
    }

    if (pn === '/api/admin/users/delete' && method === 'POST') {
        const b = await parseBody(req);
        const users = DB.get('users') || [];
        const newUsers = users.filter(u => u.id !== b.userId);
        DB.set('users', newUsers);
        return sendJSON(res, 200, { message: '删除成功' });
    }

    if (pn === '/api/admin/users/reset-password' && method === 'POST') {
        const b = await parseBody(req);
        const users = DB.get('users') || [];
        const idx = users.findIndex(x => x.id === b.userId);
        if (idx === -1) return sendJSON(res, 404, { error: '用户不存在' });
        if (b.newPassword) users[idx].password = hashPassword(b.newPassword);
        DB.set('users', users);
        return sendJSON(res, 200, { message: '密码已重置' });
    }

    if (pn === '/api/admin/posts' && method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit')) || 100;
        const posts = DB.get('posts') || [];
        const users = DB.get('users') || [];
        const sorted = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const result = sorted.slice(0, limit).map(p => {
            const a = users.find(u => u.id === p.authorId);
            return { ...p, author: a ? { id: a.id, nickname: a.nickname } : null };
        });
        return sendJSON(res, 200, { posts: result, total: posts.length });
    }

    if (pn === '/api/admin/posts/delete' && method === 'POST') {
        const b = await parseBody(req);
        const posts = DB.get('posts') || [];
        const newPosts = posts.filter(p => p.id !== b.postId);
        DB.set('posts', newPosts);
        return sendJSON(res, 200, { message: '删除成功' });
    }

    if (pn === '/api/admin/export' && method === 'GET') {
        const data = {};
        ['users', 'posts', 'messages', 'carousel', 'sections', 'sectionNames', 'announcements', 'activities'].forEach(k => {
            data[k] = DB.get(k);
        });
        return sendJSON(res, 200, { data });
    }

    if (pn === '/api/admin/import' && method === 'POST') {
        const b = await parseBody(req);
        Object.keys(b).forEach(k => { DB.set(k, b[k]); });
        return sendJSON(res, 200, { message: '导入成功' });
    }

    sendJSON(res, 404, { error: 'API not found' });
}

server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('========================================');
    console.log('  Nanfang Club Server Started');
    console.log('========================================');
    console.log('  Local:  http://localhost:' + PORT);
    console.log('  Network: http://0.0.0.0:' + PORT);
    console.log('  Root:   ' + ROOT_DIR);
    console.log('  Data:   ' + DATA_DIR);
    console.log('  Upload: ' + UPLOADS_DIR);
    console.log('========================================');
    console.log('');
});
