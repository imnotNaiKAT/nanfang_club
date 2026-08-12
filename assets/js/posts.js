/* 楠芳·俱乐部 - 帖子模块 */

const Posts = {
    // 初始化
    init: function() {
        this.loadPosts();
    },

    // 加载帖子列表
    loadPosts: function() {
        const postsGrid = document.getElementById('posts-grid');
        if (!postsGrid) return;

        const posts = Storage.get('posts') || [];
        const users = Storage.get('users') || [];

        postsGrid.innerHTML = '';

        if (posts.length === 0) {
            postsGrid.innerHTML = '<p class="no-posts">暂无帖子，快来发布第一篇吧！</p>';
            return;
        }

        // 按时间倒序排列
        const sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);

        sortedPosts.forEach(post => {
            const author = users.find(u => u.id === post.authorId);
            const card = this.createPostCard(post, author);
            postsGrid.appendChild(card);
        });
    },

    // 创建帖子卡片
    createPostCard: function(post, author) {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.onclick = () => {
            window.location.href = `post-detail.html?id=${post.id}`;
        };

        const excerpt = post.content.replace(/[#*`_\n]/g, '').substring(0, 100);
        const imageHtml = post.images && post.images.length > 0 
            ? `<img src="${post.images[0]}" alt="${post.title}" class="post-card-image">` 
            : '';

        card.innerHTML = `
            ${imageHtml}
            <div class="post-card-content">
                <h3 class="post-card-title">${post.title}</h3>
                <p class="post-card-excerpt">${excerpt}...</p>
                <div class="post-card-footer">
                    <img src="${author?.avatar || 'assets/images/default_avatar.png'}" alt="头像" class="post-card-avatar" onclick="event.stopPropagation(); goToUser('${post.authorId}')">
                    <span class="post-card-author" onclick="event.stopPropagation(); goToUser('${post.authorId}')">${author?.nickname || '未知用户'}</span>
                    <span class="post-card-date">${new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;

        return card;
    },

    // 显示发帖模态框
    showCreateModal: function() {
        if (!Auth.currentUser) {
            alert('请先登录');
            window.location.href = 'settings.html';
            return;
        }
        document.getElementById('create-post-modal').classList.add('show');
    },

    // 关闭发帖模态框
    closeCreateModal: function() {
        document.getElementById('create-post-modal').classList.remove('show');
        // 清空表单
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-images').value = '';
        document.getElementById('post-files').value = '';
        document.getElementById('image-preview').innerHTML = '';
    },

    // 提交帖子
    submitPost: function() {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();

        if (!title || !content) {
            alert('请填写标题和内容');
            return;
        }

        if (!Auth.currentUser) {
            alert('请先登录');
            return;
        }

        // 获取图片和文件
        const imageFiles = document.getElementById('post-images').files;
        const files = document.getElementById('post-files').files;

        const post = {
            id: Storage.generateId(),
            title: title,
            content: content,
            authorId: Auth.currentUser.id,
            images: [],
            files: [],
            createdAt: Date.now()
        };

        // 处理图片上传（转换为Base64）
        const promises = [];
        
        for (let i = 0; i < imageFiles.length; i++) {
            promises.push(this.fileToBase64(imageFiles[i]));
        }

        Promise.all(promises).then(images => {
            post.images = images;

            // 保存帖子
            const posts = Storage.get('posts') || [];
            posts.push(post);
            Storage.set('posts', posts);

            alert('发布成功！');
            this.closeCreateModal();
            this.loadPosts();
        }).catch(err => {
            console.error('上传失败:', err);
            alert('上传失败，请重试');
        });
    },

    // 文件转Base64
    fileToBase64: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // 删除帖子
    deletePost: function(postId) {
        if (!confirm('确定要删除这篇帖子吗？')) return;

        const posts = Storage.get('posts') || [];
        const newPosts = posts.filter(p => p.id !== postId);
        Storage.set('posts', posts);
        alert('删除成功！');
        this.loadPosts();
    }
};

// 显示发帖模态框
function showCreatePostModal() {
    Posts.showCreateModal();
}

// 关闭发帖模态框
function closeCreatePostModal() {
    Posts.closeCreateModal();
}

// 提交帖子
function submitPost() {
    Posts.submitPost();
}

// 跳转到用户主页
function goToUser(userId) {
    window.location.href = `user.html?id=${userId}`;
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 图片预览
    const imageInput = document.getElementById('post-images');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const preview = document.getElementById('image-preview');
            preview.innerHTML = '';
            const files = e.target.files;
            
            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const img = document.createElement('img');
                    img.src = ev.target.result;
                    img.className = 'preview-image';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(files[i]);
            }
        });
    }
});