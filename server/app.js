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

  if (err instanceof require('multer').MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max size is 5MB.' });
    }
  }

  // Handle custom errors from fileFilter
  if (err.message === 'Only JPG, PNG, and WEBP images are allowed.') {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;