

const getAuthCookieOptions = () => {
    const isProd = process.env.NODE_ENV === 'production';
    
    const expireDays = process.env.JWT_COOKIE_EXPIRE;
    const expires = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);

    return {
        expires,
        httpOnly: true,
        secure: isProd,
        sameSite: 'Lax',
        path: '/'
    };
};

const getRefreshCookieOptions = () => {
    const isProd = process.env.NODE_ENV === 'production';
    
    // Refresh tokens last 30 days
    const expireDays = 30;
    const expires = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);

    return {
        expires,
        httpOnly: true,
        secure: isProd,
        sameSite: 'Lax',
        path: '/'
    };
};

module.exports = { getAuthCookieOptions, getRefreshCookieOptions };
