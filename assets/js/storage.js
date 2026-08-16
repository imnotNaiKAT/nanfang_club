const Storage = {
    prefix: 'nf_',

    get(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            return false;
        }
    },

    getTheme() {
        return this.get('theme') || 'light';
    },

    setTheme(theme) {
        this.set('theme', theme);
    },

    getLayout() {
        return this.get('layout') || 'grid';
    },

    setLayout(layout) {
        this.set('layout', layout);
    },

    getColorScheme() {
        return this.get('colorScheme') || 'default';
    },

    setColorScheme(scheme) {
        this.set('colorScheme', scheme);
    },

    getMobileNavCollapsed() {
        return this.get('mobileNavCollapsed') || false;
    },

    setMobileNavCollapsed(collapsed) {
        this.set('mobileNavCollapsed', collapsed);
    },

    getSessionKey() {
        return this.get('sessionKey') || '';
    },

    setSessionKey(key) {
        if (key) this.set('sessionKey', key);
        else this.remove('sessionKey');
    },

    clearSession() {
        this.remove('sessionKey');
    },

    getAdminVerified() {
        return this.get('adminVerified') || false;
    },

    setAdminVerified(v) {
        this.set('adminVerified', v);
    },

    getFontSize() {
        return this.get('fontSize') || 'medium';
    },

    setFontSize(size) {
        this.set('fontSize', size);
    }
};