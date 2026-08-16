const Posts = {
    allPosts: [],
    currentPage: 1,
    pageSize: 20,
    currentSection: null,
    currentAuthor: null,

    async init() {
        this.currentPage = 1;
        await this.loadPosts();
        this.setupFilters();
    },

    async loadPosts() {
        try {
            let url = '/api/posts?limit=100';
            if (this.currentSection) url += '&section=' + encodeURIComponent(this.currentSection);
            if (this.currentAuthor) url += '&authorId=' + this.currentAuthor;

            const res = await API.get(url);
            if (res.success) {
                this.allPosts = res.posts || [];
                this.renderPosts();
            }
        } catch (err) {
            showToast('加载帖子失败', 'error');
        }
    },

    async loadPostsByAuthor(authorId) {
        this.currentAuthor = authorId;
        this.currentPage = 1;
        await this.loadPosts();
    },

    async loadPostsBySection(section) {
        this.currentSection = section;
        this.currentPage = 1;
        await this.loadPosts();
    },

    renderPosts() {
        const grid = document.getElementById('posts-grid');
        if (!grid) return;

        let posts = this.allPosts;
        if (this.currentSection) {
            posts = posts.filter(p => (p.section || '').toLowerCase() === this.currentSection.toLowerCase());
        }
        if (this.currentAuthor) {
            posts = posts.filter(p => p.authorId === this.currentAuthor);
        }

        if (posts.length === 0) {
            grid.innerHTML = '<div class="empty-state">暂无帖子</div>';
            return;
        }

        const start = (this.currentPage - 1) * this.pageSize;
        const pagePosts = posts.slice(start, start + this.pageSize);

        let html = '';
        pagePosts.forEach(post => {
            html += this.renderPostCard(post);
        });

        grid.innerHTML = html;
        this.renderPagination(posts.length);
    },

    renderPostCard(post) {
        const imagesHtml = post.images && post.images.length > 0
            ? `<div class="card-image"><img src="${post.images[0]}" alt="${post.title}" loading="lazy"></div>`
            : '';

        const excerpt = post.content.replace(/[#*`>_~\-!]/g, '').replace(/\[.*?\]\(.*?\)/g, '').substring(0, 80);
        const authorAvatar = post.author && post.author.avatar
            ? post.author.avatar
            : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#4A90D9"/><text x="20" y="24" text-anchor="middle" fill="white" font-size="16">' + (post.author?.nickname?.[0] || '?') + '</text></svg>')}`;

        return `
            <div class="post-card" onclick="window.location.href='post-detail.html?id=${post.id}'">
                ${imagesHtml}
                <div class="card-body">
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-excerpt">${excerpt}...</p>
                    <div class="card-meta">
                        <div class="card-author">
                            <img src="${authorAvatar}" alt="avatar" class="author-avatar" onclick="event.stopPropagation(); window.location.href='user.html?id=${post.authorId}'">
                            <span class="author-name">${post.author ? post.author.nickname : '匿名'}</span>
                        </div>
                        <div class="card-stats">
                            <span class="stat-item">❤️ ${post.likes || 0}</span>
                            <span class="stat-item">💬 ${post.comments ? post.comments.length : 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderPagination(total) {
        const container = document.getElementById('pagination');
        if (!container) return;

        const totalPages = Math.ceil(total / this.pageSize);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        if (this.currentPage > 1) {
            html += `<button class="page-btn" onclick="Posts.changePage(${this.currentPage - 1})">上一页</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="Posts.changePage(${i})">${i}</button>`;
        }

        if (this.currentPage < totalPages) {
            html += `<button class="page-btn" onclick="Posts.changePage(${this.currentPage + 1})">下一页</button>`;
        }

        container.innerHTML = html;
    },

    changePage(page) {
        this.currentPage = page;
        this.renderPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    setupFilters() {
        const sectionFilter = document.getElementById('section-filter');
        if (sectionFilter) {
            sectionFilter.addEventListener('change', (e) => {
                this.currentSection = e.target.value || null;
                this.currentPage = 1;
                this.renderPosts();
            });
        }
    },

    async deletePost(postId) {
        if (!confirm('确定要删除这个帖子吗？')) return false;
        try {
            const res = await API.posts.delete(postId);
            return res.success;
        } catch (err) {
            return false;
        }
    }
};
