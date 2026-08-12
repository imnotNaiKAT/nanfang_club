/* 楠芳·俱乐部 - 管理员模块 */

const Admin = {
    // 管理员密钥
    ADMIN_KEY: '@nf.Control~$$410.J908dawDAwd98dajwd08AQWDF89898adwjikdfaadfw*AWdf87a8wdawdawidhihqeifiAWEFoawdfohoqhwefWQEFIowqejfoweofjowhefWEFJOWEFjhowefoijhjowWEFJFOWEHWEF',

    // 是否已验证
    isAuthenticated: false,

    // 显示管理员密钥输入框
    showKeyPrompt: function() {
        document.getElementById('admin-key-modal').classList.add('show');
    },

    // 关闭密钥输入框
    closeKeyPrompt: function() {
        document.getElementById('admin-key-modal').classList.remove('show');
        document.getElementById('admin-key').value = '';
    },

    // 验证密钥
    verifyKey: function() {
        const keyInput = document.getElementById('admin-key');
        const key = keyInput.value;

        if (key === this.ADMIN_KEY) {
            this.isAuthenticated = true;
            this.closeKeyPrompt();
            this.showAdminPanel();
            alert('验证成功！已进入管理员模式');
        } else {
            alert('密钥错误！');
            keyInput.value = '';
        }
    },

    // 显示管理员面板
    showAdminPanel: function() {
        showSettingsTab('admin');
        this.loadAdminData();
    },

    // 加载管理员数据
    loadAdminData: function() {
        this.loadCarouselList();
        this.loadSectionsList();
        this.loadPostsList();
    },

    // 加载轮播图列表
    loadCarouselList: function() {
        const carouselList = document.getElementById('admin-carousel-list');
        if (!carouselList) return;

        const carousel = Storage.get('carousel') || [];
        carouselList.innerHTML = '';

        if (carousel.length === 0) {
            carouselList.innerHTML = '<p>暂无轮播图</p>';
            return;
        }

        carousel.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'admin-list-item';
            item.innerHTML = `
                <img src="${img}" alt="轮播图" style="width: 200px; height: 100px; object-fit: cover; border-radius: 4px;">
                <button class="btn btn-danger" onclick="Admin.deleteCarousel(${index})">删除</button>
            `;
            carouselList.appendChild(item);
        });
    },

    // 上传轮播图
    uploadCarousel: function() {
        const input = document.getElementById('admin-carousel-upload');
        const files = input.files;

        if (!files || files.length === 0) {
            alert('请选择图片');
            return;
        }

        const carousel = Storage.get('carousel') || [];
        const promises = [];

        for (let i = 0; i < files.length; i++) {
            promises.push(this.fileToBase64(files[i]));
        }

        Promise.all(promises).then(images => {
            images.forEach(img => carousel.push(img));
            Storage.set('carousel', carousel);
            alert('上传成功！');
            this.loadCarouselList();
            input.value = '';
        }).catch(err => {
            console.error('上传失败:', err);
            alert('上传失败');
        });
    },

    // 删除轮播图
    deleteCarousel: function(index) {
        if (!confirm('确定要删除这张轮播图吗？')) return;

        const carousel = Storage.get('carousel') || [];
        carousel.splice(index, 1);
        Storage.set('carousel', carousel);
        this.loadCarouselList();
    },

    // 加载分区列表
    loadSectionsList: function() {
        const sectionsList = document.getElementById('admin-sections-list');
        if (!sectionsList) return;

        const sections = Storage.get('sections') || [];
        sectionsList.innerHTML = '';

        sections.forEach((section, index) => {
            const item = document.createElement('div');
            item.className = 'admin-list-item';
            item.innerHTML = `
                <span>${section}</span>
                <button class="btn btn-danger" onclick="Admin.deleteSection(${index})">删除</button>
            `;
            sectionsList.appendChild(item);
        });
    },

    // 添加分区
    addSection: function() {
        const nameInput = document.getElementById('new-section-name');
        const name = nameInput.value.trim();

        if (!name) {
            alert('请输入分区名称');
            return;
        }

        const sections = Storage.get('sections') || [];
        if (sections.includes(name)) {
            alert('该分区已存在');
            return;
        }

        sections.push(name);
        Storage.set('sections', name);
        alert('添加成功！');
        nameInput.value = '';
        this.loadSectionsList();
    },

    // 删除分区
    deleteSection: function(index) {
        if (!confirm('确定要删除这个分区吗？')) return;

        const sections = Storage.get('sections') || [];
        sections.splice(index, 1);
        Storage.set('sections', sections);
        this.loadSectionsList();
    },

    // 加载帖子列表
    loadPostsList: function() {
        const postsList = document.getElementById('admin-posts-list');
        if (!postsList) return;

        const posts = Storage.get('posts') || [];
        const users = Storage.get('users') || [];

        postsList.innerHTML = '';

        if (posts.length === 0) {
            postsList.innerHTML = '<p>暂无帖子</p>';
            return;
        }

        posts.forEach(post => {
            const author = users.find(u => u.id === post.authorId);
            const item = document.createElement('div');
            item.className = 'admin-list-item';
            item.innerHTML = `
                <span>${post.title} - ${author?.nickname || '未知用户'}</span>
                <button class="btn btn-danger" onclick="Admin.deletePost('${post.id}')">删除</button>
            `;
            postsList.appendChild(item);
        });
    },

    // 删除帖子
    deletePost: function(postId) {
        if (!confirm('确定要删除这篇帖子吗？')) return;

        const posts = Storage.get('posts') || [];
        const newPosts = posts.filter(p => p.id !== postId);
        Storage.set('posts', newPosts);
        alert('删除成功！');
        this.loadPostsList();
    },

    // 添加公告/活动
    addAnnouncement: function() {
        const title = document.getElementById('announcement-title').value.trim();
        const content = document.getElementById('announcement-content').value.trim();
        const type = document.getElementById('announcement-type').value;

        if (!title || !content) {
            alert('请填写完整信息');
            return;
        }

        const item = {
            id: Storage.generateId(),
            title: title,
            content: content,
            createdAt: Date.now()
        };

        if (type === 'announcement') {
            const announcements = Storage.get('announcements') || [];
            announcements.push(item);
            Storage.set('announcements', announcements);
        } else {
            const activities = Storage.get('activities') || [];
            activities.push(item);
            Storage.set('activities', activities);
        }

        alert('添加成功！');
        document.getElementById('announcement-title').value = '';
        document.getElementById('announcement-content').value = '';
    },

    // 文件转Base64
    fileToBase64: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};

// 显示管理员密钥提示
function showAdminPrompt() {
    Admin.showKeyPrompt();
}

// 关闭管理员密钥模态框
function closeAdminModal() {
    Admin.closeKeyPrompt();
}

// 验证管理员密钥
function verifyAdminKey() {
    Admin.verifyKey();
}

// 上传轮播图
function uploadCarouselImage() {
    Admin.uploadCarousel();
}

// 添加分区
function addSection() {
    Admin.addSection();
}

// 添加公告/活动
function addAnnouncement() {
    Admin.addAnnouncement();
}