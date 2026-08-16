const Admin = {
    verified: false,

    async verify(key) {
        try {
            const res = await API.admin.verify(key);
            if (res.success) {
                this.verified = true;
                Storage.setAdminVerified(true);
                return true;
            }
            return false;
        } catch (err) {
            return false;
        }
    },

    isVerified() {
        return this.verified || Storage.getAdminVerified();
    },

    logout() {
        this.verified = false;
        Storage.setAdminVerified(false);
    },

    async getStats() {
        return API.admin.stats();
    },

    async getUsers(limit = 50) {
        return API.admin.getUsers(limit);
    },

    async getUser(userId) {
        return API.admin.getUser(userId);
    },

    async createUser(data) {
        return API.admin.createUser(data);
    },

    async updateUser(userId, data) {
        return API.admin.updateUser(userId, data);
    },

    async deleteUser(userId) {
        return API.admin.deleteUser(userId);
    },

    async resetPassword(userId, newPassword) {
        return API.admin.resetPassword(userId, newPassword);
    },

    async getPosts(limit = 100) {
        return API.admin.getPosts(limit);
    },

    async deletePost(postId) {
        return API.admin.deletePost(postId);
    },

    async getCarousel() {
        return API.carousel.getAll();
    },

    async addCarousel(data) {
        return API.admin.addCarousel(data);
    },

    async updateCarousel(id, data) {
        return API.admin.updateCarousel(id, data);
    },

    async deleteCarousel(id) {
        return API.admin.deleteCarousel(id);
    },

    async getSections() {
        return API.sections.getAll();
    },

    async addSection(name, icon) {
        return API.admin.addSection(name, icon);
    },

    async updateSection(id, data) {
        return API.admin.updateSection(id, data);
    },

    async deleteSection(id) {
        return API.admin.deleteSection(id);
    },

    async getAnnouncements() {
        return API.announcements.getAll();
    },

    async addAnnouncement(data) {
        return API.admin.addAnnouncement(data);
    },

    async updateAnnouncement(id, data) {
        return API.admin.updateAnnouncement(id, data);
    },

    async deleteAnnouncement(id) {
        return API.admin.deleteAnnouncement(id);
    },

    async getActivities() {
        return API.activities.getAll();
    },

    async addActivity(data) {
        return API.admin.addActivity(data);
    },

    async updateActivity(id, data) {
        return API.admin.updateActivity(id, data);
    },

    async deleteActivity(id) {
        return API.admin.deleteActivity(id);
    },

    async uploadImage(file) {
        return API.upload.image(file);
    }
};
