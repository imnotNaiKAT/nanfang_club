const App = {
    carouselImages: [],
    sections: [],
    announcements: [],
    activities: [],
    messages: [],
    currentSlide: 0,
    slideInterval: null,

    async init() {
        this.initTheme();
        this.initMobileNav();
        this.initSearchPlaceholder();
        this.initQuickSearch();
        await this.loadAllData();
        this.startCarousel();
        this.checkAdminVerification();
    },

    async loadAllData() {
        try {
            const [carousel, sections, announcements, activities] = await Promise.all([
                API.carousel.getAll(),
                API.sections.getAll(),
                API.announcements.getAll(),
                API.activities.getAll()
            ]);

            if (carousel.success) this.carouselImages = carousel.carousel || [];
            if (sections.success) this.sections = sections.sections || [];
            if (announcements.success) this.announcements = announcements.announcements || [];
            if (activities.success) this.activities = activities.activities || [];

            this.renderCarousel();
            this.renderAnnouncements();
            this.renderActivities();
            this.renderCustomSections();
        } catch (err) {
            console.error('Failed to load data:', err);
        }
    },

    renderCarousel() {
        const slidesEl = document.getElementById('carousel-slides');
        const dotsEl = document.getElementById('carousel-dots');
        if (!slidesEl || !dotsEl) return;

        if (this.carouselImages.length === 0) {
            slidesEl.innerHTML = `
                <div class="carousel-slide active" style="background: linear-gradient(135deg, #667eea, #764ba2); display:flex; align-items:center; justify-content:center;">
                    <div class="carousel-content" style="text-align:center; color:white; padding:40px;">
                        <h2 style="font-size:2rem; margin-bottom:8px;">欢迎来到楠芳·俱乐部</h2>
                        <p>南方中学学生自主交流平台</p>
                    </div>
                </div>
            `;
            dotsEl.innerHTML = '';
            this.currentSlide = 0;
            slidesEl.style.transform = 'translateX(0%)';
            return;
        }

        slidesEl.innerHTML = this.carouselImages.map((img) => `
            <div class="carousel-slide" style="background-image: url('${img.image}');">
                <div class="carousel-content">
                    <h2>${img.title || ''}</h2>
                    <p>${img.link ? '点击查看详情' : ''}</p>
                </div>
            </div>
        `).join('');

        dotsEl.innerHTML = this.carouselImages.map((_, i) => `
            <div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join('');

        dotsEl.querySelectorAll('.carousel-dot').forEach(el => {
            el.addEventListener('click', () => {
                this.goToSlide(parseInt(el.dataset.index));
            });
        });

        slidesEl.querySelectorAll('.carousel-slide').forEach((slide, i) => {
            slide.addEventListener('click', () => {
                if (this.carouselImages[i] && this.carouselImages[i].link) {
                    window.location.href = this.carouselImages[i].link;
                }
            });
        });

        this.currentSlide = 0;
        slidesEl.style.transform = 'translateX(0%)';
    },

    renderCustomSections() {
        const area = document.getElementById('sections-area');
        if (!area) return;

        const existingCustom = area.querySelectorAll('.section-block[data-custom="true"]');
        existingCustom.forEach(el => el.remove());

        this.sections.forEach(sec => {
            const block = document.createElement('div');
            block.className = 'section-block';
            block.setAttribute('data-section', sec.id);
            block.setAttribute('data-custom', 'true');
            block.innerHTML = `
                <div class="section-header">
                    <h2>${sec.name || sec.id}</h2>
                </div>
                <div class="section-content">
                    <div class="banner-list" id="section-${sec.id}-list">
                        <p class="empty-state">暂无内容</p>
                    </div>
                </div>
            `;
            area.appendChild(block);
        });
    },

    renderAnnouncements() {
        const listEl = document.getElementById('announcements-list');
        if (!listEl) return;

        if (this.announcements.length === 0) {
            listEl.innerHTML = '<p class="empty-state">暂无公告</p>';
            return;
        }

        listEl.innerHTML = this.announcements.slice(0, 5).map(ann => `
            <div class="banner-item" data-id="${ann.id}" style="display:flex; align-items:center; padding:12px; border-radius:8px; cursor:pointer; transition:background 0.2s;">
                <div class="banner-info" style="flex:1;">
                    <h3 style="font-size:1rem; margin-bottom:4px;">${ann.title}</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${ann.content || ''}</p>
                </div>
                <span style="font-size:0.8rem; color:var(--text-tertiary); margin-left:12px;">${new Date(ann.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
        `).join('');

        listEl.querySelectorAll('.banner-item').forEach(item => {
            item.addEventListener('click', () => {
                const ann = this.announcements.find(a => a.id === item.dataset.id);
                if (ann) {
                    const detailHtml = `
                        <div style="padding:20px; background:var(--bg-tertiary); border-radius:12px; margin-top:12px;">
                            <h3 style="margin-bottom:12px;">${ann.title}</h3>
                            <p style="margin-bottom:8px; color:var(--text-secondary);">${ann.content}</p>
                            <span style="font-size:0.8rem; color:var(--text-tertiary);">${new Date(ann.createdAt).toLocaleString('zh-CN')}</span>
                        </div>
                    `;
                    const existing = document.getElementById('ann-detail-' + ann.id);
                    if (existing) {
                        existing.remove();
                    } else {
                        const div = document.createElement('div');
                        div.id = 'ann-detail-' + ann.id;
                        div.innerHTML = detailHtml;
                        listEl.appendChild(div);
                    }
                }
            });
        });
    },

    renderActivities() {
        const listEl = document.getElementById('activities-list');
        if (!listEl) return;

        if (this.activities.length === 0) {
            listEl.innerHTML = '<p class="empty-state">暂无活动</p>';
            return;
        }

        listEl.innerHTML = this.activities.slice(0, 5).map(act => `
            <div class="banner-item" data-id="${act.id}" style="display:flex; align-items:center; padding:12px; border-radius:8px; cursor:pointer; transition:background 0.2s;">
                <div class="banner-info" style="flex:1;">
                    <h3 style="font-size:1rem; margin-bottom:4px;">${act.title}</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${act.content || ''}</p>
                </div>
                <span style="font-size:0.8rem; color:var(--text-tertiary); margin-left:12px;">${new Date(act.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
        `).join('');

        listEl.querySelectorAll('.banner-item').forEach(item => {
            item.addEventListener('click', () => {
                const act = this.activities.find(a => a.id === item.dataset.id);
                if (act) {
                    const detailHtml = `
                        <div style="padding:20px; background:var(--bg-tertiary); border-radius:12px; margin-top:12px;">
                            <h3 style="margin-bottom:12px;">${act.title}</h3>
                            <p style="margin-bottom:8px; color:var(--text-secondary);">${act.content}</p>
                            <span style="font-size:0.8rem; color:var(--text-tertiary);">${new Date(act.createdAt).toLocaleString('zh-CN')}</span>
                        </div>
                    `;
                    const existing = document.getElementById('act-detail-' + act.id);
                    if (existing) {
                        existing.remove();
                    } else {
                        const div = document.createElement('div');
                        div.id = 'act-detail-' + act.id;
                        div.innerHTML = detailHtml;
                        listEl.appendChild(div);
                    }
                }
            });
        });
    },

    nextSlide() {
        const slidesEl = document.getElementById('carousel-slides');
        const dotsEl = document.getElementById('carousel-dots');
        if (!slidesEl) return;

        const total = this.carouselImages.length || slidesEl.querySelectorAll('.carousel-slide').length;
        if (total <= 1) return;

        this.currentSlide = (this.currentSlide + 1) % total;
        slidesEl.style.transform = 'translateX(-' + (this.currentSlide * 100) + '%)';

        if (dotsEl) {
            dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === this.currentSlide);
            });
        }
    },

    prevSlide() {
        const slidesEl = document.getElementById('carousel-slides');
        const dotsEl = document.getElementById('carousel-dots');
        if (!slidesEl) return;

        const total = this.carouselImages.length || slidesEl.querySelectorAll('.carousel-slide').length;
        if (total <= 1) return;

        this.currentSlide = (this.currentSlide - 1 + total) % total;
        slidesEl.style.transform = 'translateX(-' + (this.currentSlide * 100) + '%)';

        if (dotsEl) {
            dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === this.currentSlide);
            });
        }

        clearInterval(this.slideInterval);
        this.startCarousel();
    },

    goToSlide(index) {
        const slidesEl = document.getElementById('carousel-slides');
        const dotsEl = document.getElementById('carousel-dots');
        if (!slidesEl) return;

        const total = this.carouselImages.length || slidesEl.querySelectorAll('.carousel-slide').length;
        if (total <= 1) return;

        this.currentSlide = index;
        slidesEl.style.transform = 'translateX(-' + (index * 100) + '%)';

        if (dotsEl) {
            dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === index);
            });
        }

        clearInterval(this.slideInterval);
        this.startCarousel();
    },

    startCarousel() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    },

    initTheme() {
        const theme = Storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);

        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                Storage.setTheme(next);
            });
        }
    },

    changeTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        Storage.setTheme(theme);
    },

    changeFontSize(size) {
        Storage.setFontSize(size);
        const root = document.documentElement;
        const sizes = { small: '14px', medium: '16px', large: '18px' };
        root.style.setProperty('--font-size-base', sizes[size] || sizes.medium);
    },

    initMobileNav() {
        const toggle = document.querySelector('.mobile-nav-toggle');
        const nav = document.querySelector('.main-nav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', () => {
            const collapsed = nav.classList.toggle('mobile-collapsed');
            Storage.setMobileNavCollapsed(collapsed);
        });
    },

    initSearchPlaceholder() {
        const searchInput = document.querySelector('.search-box input');
        if (!searchInput) return;

        const placeholders = [
            '键入以搜索......',
            '搜索帖子、用户、话题...',
            '试试搜索"社团"、"活动"...',
            '支持正则过滤和模糊匹配'
        ];
        let idx = 0;
        searchInput.setAttribute('placeholder', placeholders[0]);

        setInterval(() => {
            idx = (idx + 1) % placeholders.length;
            searchInput.setAttribute('placeholder', placeholders[idx]);
        }, 4000);
    },

    initQuickSearch() {
        const searchInput = document.querySelector('.search-box input');
        if (!searchInput) return;

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                window.location.href = 'search.html?q=' + encodeURIComponent(searchInput.value.trim());
            }
        });
    },

    checkAdminVerification() {
        const adminTab = document.getElementById('admin-tab');
        if (!adminTab) return;
        const verified = Storage.getAdminVerified();
        if (!verified) {
            adminTab.style.display = 'none';
        }
    }
};

function showToast(message, type) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:var(--card-bg,var(--bg-primary));color:var(--text-primary);padding:12px 24px;border-radius:12px;z-index:10000;box-shadow:0 10px 40px rgba(0,0,0,0.2);font-size:14px;animation:toastIn 0.3s ease;border:1px solid var(--border-color);';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    Storage.setTheme(next);
}

function quickSearch() {
    const input = document.querySelector('.search-box input');
    if (input && input.value.trim()) {
        window.location.href = 'search.html?q=' + encodeURIComponent(input.value.trim());
    }
}

window.App = App;
window.prevSlide = () => App.prevSlide();
window.nextSlide = () => App.nextSlide();
window.toggleTheme = function() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    Storage.setTheme(next);
};

document.addEventListener('DOMContentLoaded', async () => {
    await Auth.init();
    App.init();
});