const multer = require("multer");
const sharp = require("sharp");
const { uploadToCloudinary } = require("../utils/cloudinary");


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


const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const processedBuffer = await sharp(req.file.buffer)
      .resize(512, 512, {
        fit: 'inside',           
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })     
      .toBuffer();               
    
    const folder = req.baseUrl.includes('auth') ? 'ledgerx/profiles' : 'ledgerx/products';
    const result = await uploadToCloudinary(processedBuffer, folder);

    req.file.cloudinaryUrl = result.secure_url;
    req.file.cloudinaryPublicId = result.public_id;
    
    req.file.filename = result.public_id; 
    req.file.path = result.secure_url;

    next();
  } catch (error) {
    console.error('Image processing/upload error:', error);
    return next(new Error('Invalid or corrupted image file, or upload failed'));
  }
};

module.exports = {
  single: (fieldname) => upload.single(fieldname),
  array: (fieldname, maxCount) => upload.array(fieldname, maxCount),
  fields: (fieldsArray) => upload.fields(fieldsArray),
  processImage  
};
