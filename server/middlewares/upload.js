const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const uploadPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// ============================================================================
// SECURITY: Memory Storage for Image Re-encoding
// ============================================================================
// Use memoryStorage to receive files as buffers for processing
// Images will be decoded, resized, metadata-stripped, and re-encoded
const storage = multer.memoryStorage();

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed."), false);
  }
};

const upload = multer({  
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter
});

// ============================================================================
// SECURITY: Image Re-encoding Middleware
// ============================================================================
// Decode, resize, strip metadata (EXIF/GPS), and re-encode uploaded images
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filename = `${req.file.fieldname}-${uuidv4()}.jpg`;
    const filepath = path.join(uploadPath, filename);

    // Decode, resize, strip metadata, and re-encode
    await sharp(req.file.buffer)
      .resize(512, 512, {
        fit: 'inside',           // Maintain aspect ratio, max 512x512
        withoutEnlargement: true // Don't upscale small images
      })
      .jpeg({ quality: 85 })     // Convert to JPEG, good quality
      .toFile(filepath);         // Sharp strips metadata by default

    // Update req.file with processed image info
    req.file.filename = filename;
    req.file.path = filepath;
    req.file.mimetype = 'image/jpeg';

    next();
  } catch (error) {
    // Image decoding failed - likely malformed or malicious
    return next(new Error('Invalid or corrupted image file'));
  }
};

module.exports = {
  single: (fieldname) => upload.single(fieldname),
  array: (fieldname, maxCount) => upload.array(fieldname, maxCount),
  fields: (fieldsArray) => upload.fields(fieldsArray),
  processImage  // Export image processing middleware
};
