/* 楠芳·俱乐部 - 搜索模块 */

const Search = {
    // 执行搜索
    perform: function(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const useRegex = document.getElementById('use-regex')?.checked || false;
        const fuzzy = document.getElementById('fuzzy-search')?.checked || true;

        const results = [];
        const posts = Storage.get('posts') || [];
        const users = Storage.get('users') || [];
        const announcements = Storage.get('announcements') || [];
        const activities = Storage.get('activities') || [];

        // 搜索帖子
        posts.forEach(post => {
            const score = this.calculateScore(post, query, useRegex, fuzzy);
            if (score > 0) {
                results.push({
                    type: 'post',
                    id: post.id,
                    title: post.title,
                    content: post.content.substring(0, 150),
                    matchScore: score,
                    url: `post-detail.html?id=${post.id}`
                });
            }
        });

        // 搜索用户
        users.forEach(user => {
            const score = this.calculateUserScore(user, query, useRegex, fuzzy);
            if (score > 0) {
                results.push({
                    type: 'user',
                    id: user.id,
                    title: user.nickname,
                    content: user.bio || '暂无简介',
                    matchScore: score,
                    url: `user.html?id=${user.id}`
                });
            }
        });

        // 搜索公告
        announcements.forEach(ann => {
            const score = this.calculateScore(ann, query, useRegex, fuzzy);
            if (score > 0) {
                results.push({
                    type: 'announcement',
                    id: ann.id,
                    title: ann.title,
                    content: ann.content.substring(0, 150),
                    matchScore: score,
                    url: '#'
                });
            }
        });

        // 搜索活动
        activities.forEach(act => {
            const score = this.calculateScore(act, query, useRegex, fuzzy);
            if (score > 0) {
                results.push({
                    type: 'activity',
                    id: act.id,
                    title: act.title,
                    content: act.content.substring(0, 150),
                    matchScore: score,
                    url: '#'
                });
            }
        });

        // 按匹配度排序
        return results.sort((a, b) => b.matchScore - a.matchScore);
    },

    // 计算帖子匹配分数
    calculateScore: function(item, query, useRegex, fuzzy) {
        let score = 0;
        const title = item.title.toLowerCase();
        const content = (item.content || '').toLowerCase();
        const searchQuery = query.toLowerCase();

        try {
            if (useRegex) {
                // 正则匹配
                const regex = new RegExp(query, 'gi');
                const titleMatches = (title.match(regex) || []).length;
                const contentMatches = (content.match(regex) || []).length;
                score = titleMatches * 10 + contentMatches;
            } else if (fuzzy) {
                // 模糊匹配
                if (title.includes(searchQuery)) {
                    score += 10;
                    // 标题完全匹配加分
                    if (title === searchQuery) score += 20;
                }
                if (content.includes(searchQuery)) {
                    score += 5;
                }
                // 分词匹配
                const words = searchQuery.split(/\s+/);
                words.forEach(word => {
                    if (title.includes(word)) score += 3;
                    if (content.includes(word)) score += 1;
                });
            } else {
                // 精确匹配
                if (title === searchQuery) score = 100;
                else if (title.includes(searchQuery)) score = 50;
                else if (content.includes(searchQuery)) score = 10;
            }
        } catch (e) {
            console.error('搜索错误:', e);
        }

        return score;
    },

    // 计算用户匹配分数
    calculateUserScore: function(user, query, useRegex, fuzzy) {
        let score = 0;
        const nickname = (user.nickname || '').toLowerCase();
        const bio = (user.bio || '').toLowerCase();
        const qq = (user.qq || '').toLowerCase();
        const searchQuery = query.toLowerCase();

        if (nickname.includes(searchQuery)) score += 20;
        if (qq === searchQuery) score += 100;
        if (bio.includes(searchQuery)) score += 5;

        return score;
    },

    // 显示搜索结果
    displayResults: function(results) {
        const resultsSection = document.getElementById('search-results');
        const resultsList = document.getElementById('results-list');

        if (!resultsSection || !resultsList) return;

        resultsSection.style.display = 'block';
        resultsList.innerHTML = '';

        if (results.length === 0) {
            resultsList.innerHTML = '<p class="no-results">未找到匹配结果</p>';
            return;
        }

        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.onclick = () => {
                window.location.href = result.url;
            };

            const typeLabels = {
                'post': '帖子',
                'user': '用户',
                'announcement': '公告',
                'activity': '活动'
            };

            item.innerHTML = `
                <h3><span class="result-type">[${typeLabels[result.type]}]</span> ${result.title}</h3>
                <p>${result.content}...</p>
                <span class="result-match">匹配度: ${Math.round(result.matchScore)}%</span>
            `;

            resultsList.appendChild(item);
        });
    }
};

// 执行搜索
function performSearch() {
    const input = document.getElementById('search-input');
    const query = input.value.trim();
    
    if (!query) {
        alert('请输入搜索内容');
        return;
    }

    const results = Search.perform(query);
    Search.displayResults(results);
}

// 搜索输入回车事件
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // 从URL参数加载搜索词
        const urlQuery = new URLSearchParams(window.location.search).get('q');
        if (urlQuery) {
            searchInput.value = urlQuery;
            performSearch();
        }
    }
});