/**
 * 楠芳·俱乐部 - 配置文件
 */

const CONFIG = {
    // API 基础地址
    API_BASE: window.location.origin,

    // 默认头像
    DEFAULT_AVATAR: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNFOEU4RTgiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGR5PSIuMzVlbSIgZmlsbD0iIzlDOUM5QyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5a6h5a6hPC90ZXh0Pjwvc3ZnPg==',

    // 默认封面图
    DEFAULT_COVER: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNGNUY1RjUiLz48dGV4dCB4PSI2MDAiIHk9IjMwMCIgZHk9Ii4zNWVtIiBmaWxsPSIjQ0NDQ0NDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7lm77niZF3aWR0aCDmtYHmnJ/mnJ/lroI8L3RleHQ+PC9zdmc+',

    // 上传限制
    MAX_IMAGES: 9,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB

    // 支持的图片格式
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],

    // 分页配置
    POSTS_PER_PAGE: 20,
    COMMENTS_PER_PAGE: 10,

    // 年份范围（用于选择届数）
    MIN_YEAR: 2000,
    MAX_YEAR: new Date().getFullYear() + 3,

    // 管理员密钥（实际应该从后端验证）
    ADMIN_KEY: '@nf.Control~$$410.J908dawDAwd98dajwd08AQWDF89898adwjikdfaadfw*AWdf87a8wdawdawidhihqeifiAWEFoawdfohoqhwefWQEFIowqejfoweofjowhefWEFJOWEFjhowefoijhjowWEFJFOWEHWEF'
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}