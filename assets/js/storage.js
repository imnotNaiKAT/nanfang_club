/* 楠芳·俱乐部 - 数据存储模块 */

const Storage = {
    // 获取数据
    get: function(key) {
        try {
            const data = localStorage.getItem('nanfang_' + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    // 设置数据
    set: function(key, value) {
        try {
            localStorage.setItem('nanfang_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    // 删除数据
    remove: function(key) {
        try {
            localStorage.removeItem('nanfang_' + key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    // 清空所有数据
    clear: function() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('nanfang_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    },

    // 初始化默认数据
    initDefaultData: function() {
        // 检查是否已初始化
        if (this.get('initialized')) {
            return;
        }

        // 默认届数选项
        const currentYear = new Date().getFullYear();
        const grades = [];
        for (let i = currentYear; i >= currentYear - 10; i--) {
            grades.push(i + '届');
        }

        // 初始化用户数据
        if (!this.get('users')) {
            this.set('users', []);
        }

        // 初始化帖子数据
        if (!this.get('posts')) {
            this.set('posts', []);
        }

        // 初始化公告数据
        if (!this.get('announcements')) {
            this.set('announcements', []);
        }

        // 初始化活动数据
        if (!this.get('activities')) {
            this.set('activities', []);
        }

        // 初始化轮播图数据
        if (!this.get('carousel')) {
            this.set('carousel', []);
        }

        // 初始化分区数据
        if (!this.get('sections')) {
            this.set('sections', ['announcements', 'activities']);
        }

        // 保存届数选项
        this.set('grades', grades);

        // 标记已初始化
        this.set('initialized', true);
    },

    // 生成唯一ID
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    Storage.initDefaultData();
});