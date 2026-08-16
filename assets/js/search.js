const Search = {
    results: [],
    searchTimer: null,

    async init() {
        const input = document.getElementById('search-input');
        if (!input) return;

        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get('q');
        if (q) {
            input.value = q;
            await this.executeSearch(q);
        }

        input.addEventListener('input', (e) => {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => {
                this.executeSearch(e.target.value);
            }, 300);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeSearch(e.target.value);
            }
        });

        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.executeSearch(input.value);
            });
        }
    },

    async executeSearch(query) {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (!query.trim()) {
            container.innerHTML = '<div class="no-results">请输入搜索内容</div>';
            return;
        }

        try {
            const res = await API.search(query.trim());
            if (res.success) {
                this.results = res.results || [];
                this.renderResults();
            } else {
                container.innerHTML = '<div class="no-results">搜索失败</div>';
            }
        } catch (err) {
            container.innerHTML = '<div class="no-results">搜索出错，请稍后重试</div>';
        }
    },

    renderResults() {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (this.results.length === 0) {
            container.innerHTML = '<div class="no-results">未找到相关结果</div>';
            return;
        }

        const grouped = {
            posts: this.results.filter(r => r.type === 'post'),
            users: this.results.filter(r => r.type === 'user'),
            sections: this.results.filter(r => r.type === 'section')
        };

        let html = '';

        if (grouped.posts.length > 0) {
            html += '<div class="result-group"><h3>帖子</h3>';
            grouped.posts.forEach(post => {
                html += `
                    <div class="result-item" onclick="window.location.href='post-detail.html?id=${post.id}'">
                        <div class="result-title">${this.highlight(post.title)}</div>
                        <div class="result-content">${this.highlight(post.content.substring(0, 150))}</div>
                        <div class="result-meta">${post.author ? post.author.nickname : '匿名'} · ${new Date(post.createdAt).toLocaleDateString()}</div>
                    </div>
                `;
            });
            html += '</div>';
        }

        if (grouped.users.length > 0) {
            html += '<div class="result-group"><h3>用户</h3>';
            grouped.users.forEach(user => {
                html += `
                    <div class="result-item" onclick="window.location.href='user.html?id=${user.id}'">
                        <div class="result-title">${this.highlight(user.nickname)}</div>
                        <div class="result-content">${user.bio || '暂无简介'}</div>
                    </div>
                `;
            });
            html += '</div>';
        }

        if (grouped.sections.length > 0) {
            html += '<div class="result-group"><h3>板块</h3>';
            grouped.sections.forEach(section => {
                html += `
                    <div class="result-item">
                        <div class="result-title">${this.highlight(section.name)}</div>
                    </div>
                `;
            });
            html += '</div>';
        }

        container.innerHTML = html;
    },

    highlight(text, query) {
        if (!query) query = document.getElementById('search-input')?.value || '';
        if (!text || !query) return text || '';
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return (text + '').replace(regex, '<mark>$1</mark>');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Search.init();
});
