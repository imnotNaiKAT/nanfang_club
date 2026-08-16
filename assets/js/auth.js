const Auth = {
    currentUser: null,
    sessionKey: null,

    async init() {
        this.sessionKey = Storage.getSessionKey();
        API.setSession(this.sessionKey);
        if (this.sessionKey) {
            try {
                await this.loadUser();
            } catch (e) {
                this.logout();
            }
        }
        this.updateUI();
    },

    async loadUser() {
        const res = await API.user.getProfile();
        if (res.success && res.user) {
            this.currentUser = res.user;
        } else {
            throw new Error('Failed to load user');
        }
    },

    async login(qq, password) {
        const res = await API.user.login(qq, password);
        if (res.success) {
            this.currentUser = res.user;
            this.sessionKey = res.sessionKey;
            API.setSession(res.sessionKey);
            this.updateUI();
        }
        return res;
    },

    async register(qq, nickname, grade, password, gender) {
        const res = await API.user.register(qq, nickname, grade, password, gender);
        if (res.success) {
            this.currentUser = res.user;
            this.sessionKey = res.sessionKey;
            API.setSession(res.sessionKey);
            this.updateUI();
        }
        return res;
    },

    async logout() {
        try {
            await API.user.logout();
        } catch (e) {}
        this.currentUser = null;
        this.sessionKey = null;
        Storage.clearSession();
        API.setSession(null);
        this.updateUI();
    },

    isLoggedIn() {
        return this.currentUser !== null;
    },

    async updateUser(data) {
        const res = await API.user.update(data);
        if (res.success && res.user) {
            this.currentUser = res.user;
            this.updateUI();
        }
        return res;
    },

    async setAvatar(avatarData) {
        const res = await API.user.setAvatar(avatarData);
        if (res.success && res.user) {
            this.currentUser = res.user;
            this.updateUI();
        }
        return res;
    },

    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('nav-username');
        const userAvatar = document.getElementById('nav-avatar');
        const welcomeName = document.getElementById('welcome-username');

        if (this.isLoggedIn()) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.nickname;
            if (userAvatar) {
                userAvatar.src = this.currentUser.avatar || '';
            }
            if (welcomeName) welcomeName.textContent = this.currentUser.nickname;
            if (userInfo) {
                userInfo.style.cursor = 'pointer';
                userInfo.onclick = () => {
                    window.location.href = 'user.html?id=' + this.currentUser.id;
                };
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (userInfo) userInfo.style.display = 'none';
            if (welcomeName) welcomeName.textContent = '访客';
        }

        document.dispatchEvent(new CustomEvent('auth:updated', {
            detail: { user: this.currentUser, loggedIn: this.isLoggedIn() }
        }));
    },

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) modal.classList.add('active');
    },

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) modal.classList.remove('active');
    },

    async handleLoginForm(e) {
        e.preventDefault();
        const qq = document.getElementById('login-qq').value.trim();
        const password = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error');
        const loadingBtn = document.getElementById('login-loading');

        if (!qq || !password) {
            errorMsg.textContent = '请填写完整信息';
            errorMsg.style.display = 'block';
            return;
        }

        if (loadingBtn) loadingBtn.style.display = 'inline';
        errorMsg.style.display = 'none';

        try {
            const res = await this.login(qq, password);
            if (res.success) {
                this.hideLoginModal();
                showToast('登录成功！', 'success');
            } else {
                errorMsg.textContent = res.error || res.message || '登录失败';
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            errorMsg.textContent = '网络错误，请重试';
            errorMsg.style.display = 'block';
        } finally {
            if (loadingBtn) loadingBtn.style.display = 'none';
        }
    },

    async handleRegisterForm(e) {
        e.preventDefault();
        const qq = document.getElementById('register-qq').value.trim();
        const nickname = document.getElementById('register-nickname').value.trim();
        const grade = document.getElementById('register-grade').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        const gender = document.getElementById('register-gender').value;
        const errorMsg = document.getElementById('register-error');
        const loadingBtn = document.getElementById('register-loading');

        if (!qq || !nickname || !grade || !password || !confirmPassword) {
            errorMsg.textContent = '请填写完整信息';
            errorMsg.style.display = 'block';
            return;
        }

        if (password !== confirmPassword) {
            errorMsg.textContent = '两次输入的密码不一致';
            errorMsg.style.display = 'block';
            return;
        }

        if (password.length < 3) {
            errorMsg.textContent = '密码长度至少3位';
            errorMsg.style.display = 'block';
            return;
        }

        if (loadingBtn) loadingBtn.style.display = 'inline';
        errorMsg.style.display = 'none';

        try {
            const res = await this.register(qq, nickname, grade, password, gender);
            if (res.success) {
                showToast('注册成功！', 'success');
                this.hideLoginModal();
            } else {
                errorMsg.textContent = res.error || res.message || '注册失败';
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            errorMsg.textContent = '网络错误，请重试';
            errorMsg.style.display = 'block';
        } finally {
            if (loadingBtn) loadingBtn.style.display = 'none';
        }
    },

    openUserPanel() {
        if (!this.isLoggedIn()) {
            this.showLoginModal();
            return;
        }
        window.location.href = 'settings-new.html';
    }
};