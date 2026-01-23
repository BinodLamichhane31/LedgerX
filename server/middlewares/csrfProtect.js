const crypto = require('crypto');


const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours


const generateToken = () => {
  return crypto.randomBytes(32).toString('base64url');
};


const setCsrfCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  
  res.cookie(CSRF_COOKIE_NAME, token, {
    maxAge: CSRF_COOKIE_MAX_AGE,
    httpOnly: false, // Must be false so client can read it
    secure: isProd,
    sameSite: 'Lax', // Lax is sufficient for CSRF protection
    path: '/'
  });
};


const isExemptRoute = (req) => {
  const method = req.method.toUpperCase();
  
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  const exemptPaths = [
    '/api/auth/refresh', 
  ];

  return exemptPaths.some(path => req.path === path || req.path.startsWith(path));
};

/**
 * CSRF Protection Middleware
 */
const csrfProtect = (req, res, next) => {
  // Generate or retrieve CSRF token
  let csrfToken = req.cookies[CSRF_COOKIE_NAME];
  
  if (!csrfToken) {
    // Generate new token if not present
    csrfToken = generateToken();
    setCsrfCookie(res, csrfToken);
  }

  // Exempt safe routes
  if (isExemptRoute(req)) {
    // Always set/refresh cookie on GET requests so client can read it
    if (req.method === 'GET') {
      setCsrfCookie(res, csrfToken);
    }
    return next();
  }

  // For state-changing methods, verify CSRF token
  const headerToken = req.headers[CSRF_HEADER_NAME] || req.headers[CSRF_HEADER_NAME.toLowerCase()];
  
  if (!headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing. Please refresh the page and try again.'
    });
  }


  if (csrfToken.length !== headerToken.length) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token. Please refresh the page and try again.'
    });
  }

  try {
    if (!crypto.timingSafeEqual(Buffer.from(csrfToken), Buffer.from(headerToken))) {
      return res.status(403).json({
        success: false,
        message: 'Invalid CSRF token. Please refresh the page and try again.'
      });
    }
  } catch (error) {
    // If timingSafeEqual fails (shouldn't happen after length check), reject
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token. Please refresh the page and try again.'
    });
  }

  // Token is valid, proceed
  next();
};

module.exports = csrfProtect;
