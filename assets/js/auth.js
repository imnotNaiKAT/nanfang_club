/* 楠芳·俱乐部 - 用户认证模块 */

const Auth = {
    // 当前登录用户
    currentUser: null,

    // 初始化
    init: function() {
        this.checkLogin();
        this.initGradeOptions();
        this.bindEvents();
    },

    // 检查登录状态
    checkLogin: function() {
        const userId = Storage.get('currentUserId');
        if (userId) {
            const users = Storage.get('users') || [];
            this.currentUser = users.find(u => u.id === userId);
            if (this.currentUser) {
                this.updateUI(true);
            }
        }
    },

    // 初始化届数选项
    initGradeOptions: function() {
        const grades = Storage.get('grades') || [];
        const select = document.getElementById('reg-grade');
        if (select) {
            select.innerHTML = '<option value="">请选择届数</option>';
            grades.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade;
                option.textContent = grade;
                select.appendChild(option);
            });
        }
    },

    // 绑定事件
    bindEvents: function() {
        // 登录表单
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // 注册表单
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
        }

        // 头像预览
        const avatarInput = document.getElementById('edit-avatar');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                this.previewAvatar(e.target.files[0]);
            });
        }
    },

    // 登录
    login: function() {
        const qq = document.getElementById('login-qq').value.trim();
        const password = document.getElementById('login-password').value;

        if (!qq || !password) {
            alert('请填写完整信息');
            return;
        }

        const users = Storage.get('users') || [];
        const user = users.find(u => u.qq === qq);

        if (!user) {
            alert('账号不存在');
            return;
        }

        if (user.password !== password) {
            alert('密码错误');
            return;
        }

        // 登录成功
        this.currentUser = user;
        Storage.set('currentUserId', user.id);
        this.updateUI(true);
        alert('登录成功！');
        location.reload();
    },

    // 注册
    register: function() {
        const qq = document.getElementById('reg-qq').value.trim();
        const nickname = document.getElementById('reg-nickname').value.trim();
        const grade = document.getElementById('reg-grade').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        // 验证
        if (!qq || !nickname || !grade || !password) {
            alert('请填写完整信息');
            return;
        }

        if (!/^\d{5,11}$/.test(qq)) {
            alert('请输入有效的QQ号（5-11位数字）');
            return;
        }

        if (password.length < 6) {
            alert('密码至少需要6位');
            return;
        }

        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }

        // 检查QQ是否已存在
        const users = Storage.get('users') || [];
        if (users.find(u => u.qq === qq)) {
            alert('该QQ号已被注册');
            return;
        }

        // 创建用户
        const newUser = {
            id: Storage.generateId(),
            qq: qq,
            nickname: nickname,
            grade: grade,
            password: password,
            gender: '',
            avatar: '',
            bio: '',
            createdAt: Date.now()
        };

        users.push(newUser);
        Storage.set('users', users);

        alert('注册成功！请登录');
        switchAuthTab('login');
    },

    // 更新个人资料
    updateProfile: function() {
        if (!this.currentUser) {
            alert('请先登录');
            return;
        }

        const nickname = document.getElementById('edit-nickname').value.trim();
        const gender = document.getElementById('edit-gender').value;
        const bio = document.getElementById('edit-bio').value.trim();
        const newPassword = document.getElementById('edit-password').value;

        if (!nickname) {
            alert('昵称不能为空');
            return;
        }

        const users = Storage.get('users') || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);

        if (userIndex === -1) {
            alert('用户不存在');
            return;
        }

        // 更新用户信息
        users[userIndex].nickname = nickname;
        users[userIndex].gender = gender;
        users[userIndex].bio = bio;

        if (newPassword) {
            if (newPassword.length < 6) {
                alert('密码至少需要6位');
                return;
            }
            users[userIndex].password = newPassword;
        }

        // 更新头像
        const avatarPreview = document.querySelector('#avatar-preview img');
        if (avatarPreview) {
            users[userIndex].avatar = avatarPreview.src;
        }

        Storage.set('users', users);
        this.currentUser = users[userIndex];
        alert('保存成功！');
        location.reload();
    },

    // 头像预览
    previewAvatar: function(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const previewArea = document.getElementById('avatar-preview');
            previewArea.innerHTML = `<img src="${e.target.result}" alt="头像预览">`;
        };
        reader.readAsDataURL(file);
    },

    // 退出登录
    logout: function() {
        this.currentUser = null;
        Storage.remove('currentUserId');
        this.updateUI(false);
        alert('已退出登录');
        window.location.href = 'index.html';
    },

    // 更新UI
    updateUI: function(isLoggedIn) {
        const userInfo = document.getElementById('user-info');
        const loginBtn = document.getElementById('login-btn');
        const welcomeUsername = document.getElementById('welcome-username');

        if (isLoggedIn && this.currentUser) {
            // 显示用户信息
            if (userInfo) {
                userInfo.style.display = 'flex';
                const avatar = document.getElementById('nav-avatar');
                const username = document.getElementById('nav-username');
                if (avatar) avatar.src = this.currentUser.avatar || 'assets/images/default_avatar.png';
                if (username) username.textContent = this.currentUser.nickname;
            }

            // 隐藏登录按钮
            if (loginBtn) loginBtn.style.display = 'none';

            // 更新欢迎信息
            if (welcomeUsername) {
                welcomeUsername.textContent = this.currentUser.nickname;
            }

            // 显示个人资料面板
            const authSection = document.getElementById('auth-section');
            const profileSection = document.getElementById('profile-section');
            if (authSection) authSection.style.display = 'none';
            if (profileSection) {
                profileSection.style.display = 'block';
                this.loadProfileData();
            }
        } else {
            // 隐藏用户信息
            if (userInfo) userInfo.style.display = 'none';

            // 显示登录按钮
            if (loginBtn) loginBtn.style.display = 'inline';

            // 更新欢迎信息
            if (welcomeUsername) {
                welcomeUsername.textContent = '访客';
            }
        }
    },

    // 加载个人资料数据
    loadProfileData: function() {
        if (!this.currentUser) return;

        document.getElementById('edit-nickname').value = this.currentUser.nickname || '';
        document.getElementById('edit-gender').value = this.currentUser.gender || '';
        document.getElementById('edit-bio').value = this.currentUser.bio || '';

        const profileAvatar = document.getElementById('profile-avatar');
        const profileNickname = document.getElementById('profile-nickname');
        const profileQQ = document.getElementById('profile-qq');
        const profileGrade = document.getElementById('profile-grade');

        if (profileAvatar) profileAvatar.src = this.currentUser.avatar || 'assets/images/default_avatar.png';
        if (profileNickname) profileNickname.textContent = this.currentUser.nickname;
        if (profileQQ) profileQQ.textContent = 'QQ: ' + this.currentUser.qq;
        if (profileGrade) profileGrade.textContent = this.currentUser.grade;
    }
};

// 切换认证标签页
function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'login') {
        tabs[0].classList.add('active');
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
    }
}

// 更新个人资料
function updateProfile() {
    Auth.updateProfile();
}

// 退出登录
function logout() {
    Auth.logout();
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
});