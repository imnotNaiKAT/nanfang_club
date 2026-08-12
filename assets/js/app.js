/* 楠芳·俱乐部 - 主应用模块 */

const App = {
    // 轮播图当前索引
    currentSlide: 0,

    // 初始化
    init: function() {
        this.initTheme();
        this.initCarousel();
        this.loadSections();
        this.bindGlobalEvents();
    },

    // 初始化主题
    initTheme: function() {
        const savedTheme = Storage.get('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
    },

    // 切换主题
    toggleTheme: function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        Storage.set('theme', newTheme);
    },

    // 更改主题
    changeTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        Storage.set('theme', theme);
    },

    // 更改字体大小
    changeFontSize: function(size) {
        const sizes = {
            'small': '14px',
            'medium': '16px',
            'large': '18px'
        };
        document.documentElement.style.fontSize = sizes[size] || '16px';
        Storage.set('fontSize', size);
    },

    // 初始化轮播图
    initCarousel: function() {
        const carousel = Storage.get('carousel') || [];
        const slidesEl = document.getElementById('carousel-slides');
        const dotsEl = document.getElementById('carousel-dots');

        if (!slidesEl || !dotsEl) return;

        // 如果没有轮播图，显示占位
        if (carousel.length === 0) {
            slidesEl.innerHTML = '<div class="carousel-slide" style="background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-tertiary);">请上传活动图片</div>';
            dotsEl.innerHTML = '';
            return;
        }

        // 创建幻灯片
        slidesEl.innerHTML = carousel.map((img, i) => 
            `<img src="${img}" alt="轮播图 ${i + 1}" class="carousel-slide">`
        ).join('');

        // 创建指示点
        dotsEl.innerHTML = carousel.map((_, i) => 
            `<span class="carousel-dot ${i === 0 ? 'active' : ''}" onclick="App.goToSlide(${i})"></span>`
        ).join('');

        // 自动轮播
        if (carousel.length > 1) {
            setInterval(() => this.nextSlide(), 5000);
        }
    },

    // 上一张幻灯片
    prevSlide: function() {
        const carousel = Storage.get('carousel') || [];
        if (carousel.length === 0) return;

        this.currentSlide = (this.currentSlide - 1 + carousel.length) % carousel.length;
        this.updateCarousel();
    },

    // 下一张幻灯片
    nextSlide: function() {
        const carousel = Storage.get('carousel') || [];
        if (carousel.length === 0) return;

        this.currentSlide = (this.currentSlide + 1) % carousel.length;
        this.updateCarousel();
    },

    // 跳转到指定幻灯片
    goToSlide: function(index) {
        this.currentSlide = index;
        this.updateCarousel();
    },

    // 更新轮播图显示
    updateCarousel: function() {
        const slidesEl = document.getElementById('carousel-slides');
        const dots = document.querySelectorAll('.carousel-dot');

        if (!slidesEl) return;

        slidesEl.style.transform = `translateX(-${this.currentSlide * 100}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentSlide);
        });
    },

    // 加载分区
    loadSections: function() {
        this.loadAnnouncements();
        this.loadActivities();
    },

    // 加载公告
    loadAnnouncements: function() {
        const listEl = document.getElementById('announcements-list');
        if (!listEl) return;

        const announcements = Storage.get('announcements') || [];

        if (announcements.length === 0) {
            listEl.innerHTML = '<p class="empty-message">暂无公告</p>';
            return;
        }

        listEl.innerHTML = announcements.map(ann => `
            <div class="banner-item" onclick="alert('${ann.content}')">
                <div class="banner-info">
                    <h3>${ann.title}</h3>
                    <p>${new Date(ann.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
    },

    // 加载活动
    loadActivities: function() {
        const listEl = document.getElementById('activities-list');
        if (!listEl) return;

        const activities = Storage.get('activities') || [];

        if (activities.length === 0) {
            listEl.innerHTML = '<p class="empty-message">暂无活动</p>';
            return;
        }

        listEl.innerHTML = activities.map(act => `
            <div class="banner-item" onclick="alert('${act.content}')">
                <div class="banner-info">
                    <h3>${act.title}</h3>
                    <p>${new Date(act.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
    },

    // 绑定全局事件
    bindGlobalEvents: function() {
        // 快速搜索
        const quickSearchInput = document.getElementById('quick-search');
        if (quickSearchInput) {
            quickSearchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const query = this.value.trim();
                    if (query) {
                        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                    }
                }
            });
        }

        // 加载保存的字体大小
        const savedFontSize = Storage.get('fontSize');
        if (savedFontSize) {
            this.changeFontSize(savedFontSize);
            const fontSizeSelect = document.getElementById('font-size');
            if (fontSizeSelect) {
                fontSizeSelect.value = savedFontSize;
            }
        }
    }
};

// 全局函数
function toggleTheme() {
    App.toggleTheme();
}

function changeTheme(theme) {
    App.changeTheme(theme);
}

function changeFontSize(size) {
    App.changeFontSize(size);
}

function prevSlide() {
    App.prevSlide();
}

function nextSlide() {
    App.nextSlide();
}

function quickSearch() {
    const input = document.getElementById('quick-search');
    const query = input.value.trim();
    if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
}

// 设置页面标签切换
function showSettingsTab(tabName) {
    const tabs = document.querySelectorAll('.settings-tab');
    const menuItems = document.querySelectorAll('.settings-menu li');

    tabs.forEach(tab => tab.style.display = 'none');
    menuItems.forEach(item => item.classList.remove('active'));

    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.style.display = 'block';
    }

    // 高亮对应的菜单项
    menuItems.forEach(item => {
        if (item.textContent.includes(tabName === 'account' ? '账号' : '设置')) {
            item.classList.add('active');
        }
    });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    App.init();

    // 如果在帖子页面，初始化帖子模块
    if (document.getElementById('posts-grid')) {
        Posts.init();
    }

    // 如果在设置页面，加载设置
    if (document.querySelector('.settings-page')) {
        Auth.init();
    }
});