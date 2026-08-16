const API = {
    base: '',
    sessionKey: null,

    init() {
        this.sessionKey = Storage.getSessionKey();
    },

    setSession(key) {
        this.sessionKey = key;
        Storage.setSessionKey(key);
    },

    getSession() {
        if (!this.sessionKey) this.sessionKey = Storage.getSessionKey();
        return this.sessionKey;
    },

    async fetch(path, options = {}) {
        const url = this.base + path;
        const headers = { 'Content-Type': 'application/json' };
        if (options.headers) Object.assign(headers, options.headers);

        const sk = this.getSession();
        if (sk && !url.includes('session=')) {
            headers['Authorization'] = 'Bearer ' + sk;
        }

        const res = await fetch(url, { ...options, headers });
        return res.json();
    },

    async get(path) {
        return this.fetch(path);
    },

    async post(path, data) {
        return this.fetch(path, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async upload(path, formData) {
        const url = this.base + path;
        const headers = {};
        const sk = this.getSession();
        if (sk) headers['Authorization'] = 'Bearer ' + sk;
        const res = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: formData
        });
        return res.json();
    },

    async delete(path, data) {
        return this.fetch(path, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    },

    async search(q, regex) {
        let url = '/api/search?q=' + encodeURIComponent(q);
        if (regex) url += '&regex=true';
        return this.get(url);
    },

    user: {
        async register(qq, nickname, grade, password, gender) {
            return API.post('/api/users/register', { qq, nickname, grade, password, gender });
        },
        async login(qq, password) {
            return API.post('/api/users/login', { qq, password });
        },
        async logout() {
            return API.post('/api/users/logout', { sessionKey: API.getSession() });
        },
        async getProfile() {
            return API.get('/api/users/profile');
        },
        async getById(id) {
            return API.get('/api/users/' + id);
        },
        async update(data) {
            return API.post('/api/users/update', data);
        },
        async setAvatar(avatar) {
            return API.post('/api/users/avatar', { avatar });
        },
        async follow(targetId) {
            return API.post('/api/users/follow', { targetId });
        },
        async stats() {
            return API.get('/api/users/stats');
        }
    },

    posts: {
        async getAll(limit, authorId, section) {
            let url = '/api/posts';
            const params = [];
            if (limit) params.push('limit=' + limit);
            if (authorId) params.push('authorId=' + authorId);
            if (section) params.push('section=' + encodeURIComponent(section));
            if (params.length) url += '?' + params.join('&');
            return API.get(url);
        },
        async getById(id) {
            return API.get('/api/posts/' + id);
        },
        async create(title, content, images, tags, section) {
            return API.post('/api/posts/create', { title, content, images, tags, section });
        },
        async like(postId) {
            return API.post('/api/posts/like', { postId });
        },
        async comment(postId, content, replyTo) {
            return API.post('/api/posts/comment', { postId, content, replyTo });
        },
        async collect(postId) {
            return API.post('/api/posts/collect', { postId });
        },
        async delete(postId) {
            return API.post('/api/posts/delete', { postId });
        },
        async byAuthor(authorId) {
            return this.getAll(null, authorId);
        }
    },

    sections: {
        async getAll() {
            return API.get('/api/sections');
        },
        async add(name, icon) {
            return API.post('/api/sections/add', { name, icon });
        },
        async delete(id) {
            return API.post('/api/sections/delete', { id });
        }
    },

    announcements: {
        async getAll() {
            return API.get('/api/announcements');
        },
        async add(title, content, link) {
            return API.post('/api/announcements/add', { title, content, link });
        },
        async update(id, data) {
            return API.post('/api/announcements/update', { id, ...data });
        },
        async delete(id) {
            return API.post('/api/announcements/delete', { id });
        }
    },

    activities: {
        async getAll() {
            return API.get('/api/activities');
        },
        async add(title, content, link) {
            return API.post('/api/activities/add', { title, content, link });
        },
        async update(id, data) {
            return API.post('/api/activities/update', { id, ...data });
        },
        async delete(id) {
            return API.post('/api/activities/delete', { id });
        }
    },

    carousel: {
        async getAll() {
            return API.get('/api/carousel');
        },
        async add(title, image, link) {
            return API.post('/api/carousel/add', { title, image, link });
        },
        async update(id, data) {
            return API.post('/api/carousel/update', { id, ...data });
        },
        async delete(id) {
            return API.post('/api/carousel/delete', { id });
        }
    },

    messages: {
        async getAll(userId) {
            let url = '/api/messages';
            if (userId) url += '?userId=' + userId;
            return API.get(url);
        },
        async markRead(messageId) {
            return API.post('/api/messages/read', { messageId });
        },
        async send(toUserId, type, content, postId) {
            return API.post('/api/messages/send', { toUserId, type, content, postId });
        },
        async unreadCount(userId) {
            let url = '/api/messages/unread';
            if (userId) url += '?userId=' + userId;
            return API.get(url);
        }
    },

    upload: {
        async image(file) {
            const formData = new FormData();
            formData.append('file', file);
            return API.upload('/api/upload/image', formData);
        },
        async avatar(file) {
            const formData = new FormData();
            formData.append('file', file);
            return API.upload('/api/upload/avatar', formData);
        }
    },

    admin: {
        async verify(key) {
            return API.post('/api/admin/verify', { key });
        },
        async stats() {
            return API.get('/api/admin/stats');
        },
        async getUsers(limit) {
            let url = '/api/admin/users';
            if (limit) url += '?limit=' + limit;
            return API.get(url);
        },
        async getUser(userId) {
            return API.get('/api/users/' + userId);
        },
        async createUser(data) {
            return API.post('/api/admin/users/create', data);
        },
        async updateUser(userId, data) {
            return API.post('/api/admin/users/update', { userId, ...data });
        },
        async deleteUser(userId) {
            return API.post('/api/admin/users/delete', { userId });
        },
        async resetPassword(userId, newPassword) {
            return API.post('/api/admin/users/reset-password', { userId, newPassword });
        },
        async getPosts(limit) {
            let url = '/api/admin/posts';
            if (limit) url += '?limit=' + limit;
            return API.get(url);
        },
        async deletePost(postId) {
            return API.post('/api/admin/posts/delete', { postId });
        },
        async exportData() {
            return API.get('/api/admin/export');
        },
        async importData(data) {
            return API.post('/api/admin/import', data);
        },
        async addCarousel(data) {
            return API.post('/api/carousel/add', data);
        },
        async updateCarousel(id, data) {
            return API.post('/api/carousel/update', { id, ...data });
        },
        async deleteCarousel(id) {
            return API.post('/api/carousel/delete', { id });
        },
        async addSection(name, icon) {
            return API.post('/api/sections/add', { name, icon });
        },
        async updateSection(id, data) {
            return API.post('/api/sections/update', { id, ...data });
        },
        async deleteSection(id) {
            return API.post('/api/sections/delete', { id });
        },
        async addAnnouncement(data) {
            return API.post('/api/announcements/add', data);
        },
        async updateAnnouncement(id, data) {
            return API.post('/api/announcements/update', { id, ...data });
        },
        async deleteAnnouncement(id) {
            return API.post('/api/announcements/delete', { id });
        },
        async addActivity(data) {
            return API.post('/api/activities/add', data);
        },
        async updateActivity(id, data) {
            return API.post('/api/activities/update', { id, ...data });
        },
        async deleteActivity(id) {
            return API.post('/api/activities/delete', { id });
        }
    }
};

API.init();