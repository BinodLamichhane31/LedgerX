const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();   
const userRoutes = require("./routes/userRoutes");
const mfaRoutes = require("./routes/mfaRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");

const shopRoutes = require("./routes/shopRoutes");
const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const productRoutes = require("./routes/productRoutes");
const saleRoutes = require("./routes/saleRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const cashRoutes = require("./routes/cashRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const botRoutes = require("./routes/botRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const mongoSanitize = require('@exortek/express-mongo-sanitize')
const globalLimiter = require("./middlewares/rateLimiter").globalLimiter;

// Secure CORS Configuration
// CRITICAL: When credentials: true, origin MUST NOT be '*' (wildcard)
// Only trusted frontend URLs are allowed
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Required for httpOnly cookies
    optionsSuccessStatus: 200
};

const app = express();
app.set("trust proxy", 1);

app.use(cors(corsOptions));


// Helmet
app.use(helmet({
  hsts: false  // Disable HSTS by default, enable only in production
}));

// Content Security Policy (CSP) - Conservative defaults for API backend
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],                    // Only allow resources from same origin
    scriptSrc: ["'self'"],                     // Only allow scripts from same origin
    styleSrc: ["'self'"],                      // Only allow styles from same origin
    imgSrc: ["'self'", "data:"],               // Allow images from same origin + data URIs
    fontSrc: ["'self'"],                       // Only allow fonts from same origin
    connectSrc: ["'self'"],                    // Only allow AJAX/WebSocket to same origin
    frameAncestors: ["'none'"],                // Prevent clickjacking (CSP equivalent of X-Frame-Options: DENY)
    baseUri: ["'self'"],                       // Restrict base tag URLs
    formAction: ["'self'"]                     // Restrict form submissions to same origin
  }
}));

// HTTP Strict Transport Security (HSTS) - Production only, requires HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({
    maxAge: 31536000,        // 1 year in seconds
    includeSubDomains: true, // Apply to all subdomains
    preload: true            // Allow inclusion in browser HSTS preload lists
  }));
}

// 4. X-Frame-Options -
app.use(helmet.frameguard({ action: "deny" }));

// 5. X-Content-Type-Options
app.use(helmet.noSniff());

// 6. Cross-Origin Resource Policy
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));


app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// CSRF Protection - must be after cookieParser
const csrfProtect = require('./middlewares/csrfProtect');
app.use(csrfProtect);

app.use(mongoSanitize());


//Global Rate Limit
app.use(globalLimiter);

app.use("/api/uploads", express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", userRoutes);
app.use("/api/mfa", mfaRoutes);
app.use("/api/admin", adminRoutes); 
app.use("/api/shops", shopRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cash", cashRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/payments", paymentRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Multer file size error
  if (err instanceof require('multer').MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'Image file is too large. Please upload an image smaller than 5MB.' 
      });
    }
    // Other multer errors
    return res.status(400).json({ 
      success: false, 
      message: 'File upload error. Please try again.' 
    });
  }

  // File type validation error
  if (err.message === 'Only JPG, PNG, and WEBP images are allowed.') {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.' 
    });
  }

  // Image processing error (from sharp/processImage middleware)
  if (err.message === 'Invalid or corrupted image file, or upload failed') {
    return res.status(400).json({ 
      success: false, 
      message: 'The uploaded image is corrupted or invalid. Please try a different image.' 
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;