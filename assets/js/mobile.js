/* 楠芳·俱乐部 - 移动端模块 */

const Mobile = {
    // 是否为移动设备
    isMobile: false,

    // 初始化
    init: function() {
        this.detectMobile();
        this.bindEvents();
        this.initMobileMenu();
        this.loadMobileSettings();
    },

    // 检测移动设备
    detectMobile: function() {
        this.isMobile = window.innerWidth <= 768 || 
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (this.isMobile) {
            document.body.classList.add('is-mobile');
        } else {
            document.body.classList.remove('is-mobile');
        }
    },

    // 绑定事件
    bindEvents: function() {
        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.detectMobile();
        });

        // 滑动关闭菜单
        this.setupSwipeToClose();
    },

    // 初始化移动端菜单
    initMobileMenu: function() {
        // 检查是否已存在菜单
        if (document.querySelector('.mobile-menu')) return;

        // 创建菜单按钮
        this.createMobileMenuBtn();

        // 创建侧边菜单
        this.createMobileMenu();

        // 创建底部导航
        this.createBottomNav();
    },

    // 创建菜单按钮
    createMobileMenuBtn: function() {
        const navRight = document.querySelector('.nav-right');
        if (!navRight) return;

        // 检查是否已存在
        if (document.querySelector('.mobile-menu-btn')) return;

        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn mobile-only';
        menuBtn.style.display = 'none';
        menuBtn.innerHTML = '<span></span><span></span><span></span>';
        menuBtn.onclick = () => this.toggleMobileMenu();

        navRight.insertBefore(menuBtn, navRight.firstChild);
    },

    // 创建侧边菜单
    createMobileMenu: function() {
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.onclick = () => this.closeMobileMenu();
        document.body.appendChild(overlay);

        // 创建菜单容器
        const menu = document.createElement('div');
        menu.className = 'mobile-menu';
        menu.innerHTML = this.getMobileMenuContent();
        document.body.appendChild(menu);
    },

    // 获取菜单内容
    getMobileMenuContent: function() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentUser = Auth.currentUser;
        
        let userSection = '';
        if (currentUser) {
            userSection = `
                <div class="mobile-user-info">
                    <img src="${currentUser.avatar || 'assets/images/default_avatar.png'}" alt="头像" class="user-avatar" onerror="this.src='assets/images/default_avatar.png'">
                    <div class="user-name">${currentUser.nickname}</div>
                    <div class="user-grade">${currentUser.grade || ''}</div>
                </div>
            `;
        } else {
            userSection = `
                <div class="mobile-user-logged-out">
                    <p>未登录</p>
                    <a href="settings-new.html">去登录</a>
                </div>
            `;
        }

        return `
            <nav class="mobile-menu-nav">
                <a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">主页</a>
                <a href="posts.html" class="${currentPage === 'posts.html' ? 'active' : ''}">帖子</a>
                <a href="search.html" class="${currentPage === 'search.html' ? 'active' : ''}">搜索</a>
                <a href="settings-new.html" class="${currentPage === 'settings-new.html' ? 'active' : ''}">设置</a>
                <a href="about.html" class="${currentPage === 'about.html' ? 'active' : ''}">关于</a>
            </nav>
            <div class="mobile-search">
                <input type="text" placeholder="键入以搜索......" id="mobile-search-input">
            </div>
            ${userSection}
            <div class="mobile-settings">
                <div class="mobile-setting-item">
                    <label>深色模式</label>
                    <input type="checkbox" id="mobile-theme-toggle" onchange="Mobile.toggleMobileTheme(this.checked)">
                </div>
                <div class="mobile-setting-item">
                    <label>字体大小</label>
                    <select id="mobile-font-size" onchange="Mobile.changeMobileFontSize(this.value)">
                        <option value="small">小</option>
                        <option value="medium">中</option>
                        <option value="large">大</option>
                    </select>
                </div>
            </div>
        `;
    },

    // 创建底部导航
    createBottomNav: function() {
        if (document.querySelector('.mobile-bottom-nav')) return;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        const bottomNav = document.createElement('nav');
        bottomNav.className = 'mobile-bottom-nav';
        bottomNav.innerHTML = `
            <a href="index.html" class="mobile-bottom-nav-item ${currentPage === 'index.html' ? 'active' : ''}">
                <span class="nav-icon">🏠</span>
                <span>主页</span>
            </a>
            <a href="posts.html" class="mobile-bottom-nav-item ${currentPage === 'posts.html' ? 'active' : ''}">
                <span class="nav-icon">📝</span>
                <span>帖子</span>
            </a>
            <a href="search.html" class="mobile-bottom-nav-item ${currentPage === 'search.html' ? 'active' : ''}">
                <span class="nav-icon">🔍</span>
                <span>搜索</span>
            </a>
            <a href="settings-new.html" class="mobile-bottom-nav-item ${currentPage === 'settings-new.html' ? 'active' : ''}">
                <span class="nav-icon">⚙️</span>
                <span>设置</span>
            </a>
        `;

        document.body.appendChild(bottomNav);
    },

    // 切换菜单
    toggleMobileMenu: function() {
        const menu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        const menuBtn = document.querySelector('.mobile-menu-btn');

        if (menu.classList.contains('show')) {
            this.closeMobileMenu();
        } else {
            menu.classList.add('show');
            overlay.classList.add('show');
            menuBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    // 关闭菜单
    closeMobileMenu: function() {
        const menu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        const menuBtn = document.querySelector('.mobile-menu-btn');

        if (menu) {
            menu.classList.remove('show');
            overlay.classList.remove('show');
            menuBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // 设置滑动关闭
    setupSwipeToClose: function() {
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            
            // 右滑关闭菜单
            if (touchEndX - touchStartX > 100) {
                this.closeMobileMenu();
            }
        }, { passive: true });
    },

    // 加载移动端设置
    loadMobileSettings: function() {
        // 延迟加载，等待DOM准备好
        setTimeout(() => {
            const themeToggle = document.getElementById('mobile-theme-toggle');
            const fontSelect = document.getElementById('mobile-font-size');
            const searchInput = document.getElementById('mobile-search-input');

            // 主题
            if (themeToggle) {
                const savedTheme = Storage.getTheme();
                themeToggle.checked = savedTheme === 'dark';
            }

            // 字体大小
            if (fontSelect) {
                const savedFontSize = Storage.getFontSize();
                fontSelect.value = savedFontSize;
            }

            // 搜索
            if (searchInput) {
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const query = searchInput.value.trim();
                        if (query) {
                            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                        }
                    }
                });
            }
        }, 100);
    },

    // 切换移动端主题
    toggleMobileTheme: function(isDark) {
        const theme = isDark ? 'dark' : 'light';
        App.changeTheme(theme);
    },

    // 更改移动端字体大小
    changeMobileFontSize: function(size) {
        App.changeFontSize(size);
    },

    // 更新用户信息
    updateUserInfo: function() {
        const menu = document.querySelector('.mobile-menu');
        if (menu) {
            const userSection = menu.querySelector('.mobile-user-info, .mobile-user-logged-out');
            if (userSection) {
                userSection.outerHTML = this.getMobileMenuContent().match(/<div class="mobile-user-info[\s\S]*?<\/div>\s*<\/div>|<div class="mobile-user-logged-out[\s\S]*?<\/div>/)?.[0] || '';
            }
        }
    }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    Mobile.init();
});

// 窗口大小变化时重新检测
window.addEventListener('resize', function() {
    Mobile.detectMobile();
});