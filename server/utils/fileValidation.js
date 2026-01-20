const fs = require('fs');
const path = require('path');

// Safe MIME type to extension mapping
const mimeToExtension = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};


const validateImageFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.open(filePath, 'r', (err, fd) => {
      if (err) return reject(err);

      const buffer = Buffer.alloc(12);
      fs.read(fd, buffer, 0, 12, 0, (err, bytesRead, buffer) => {
        fs.close(fd, () => {}); 
        if (err) return reject(err);

        // Check Magic Bytes
        const header = buffer.toString('hex').toUpperCase();
        let isValid = false;
        let detectedType = 'unknown';

        // JPEG: FF D8 FF
        if (header.startsWith('FFD8FF')) {
          isValid = true;
          detectedType = 'image/jpeg';
        }
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        else if (header.startsWith('89504E470D0A1A0A')) {
          isValid = true;
          detectedType = 'image/png';
        }
        // WebP: RIFF .... WEBP (bytes 0-3 RIFF, 8-11 WEBP)
        else if (header.startsWith('52494646') && header.slice(16, 24) === '57454250') {
          isValid = true;
          detectedType = 'image/webp';
        }
        // GIF: GIF87a or GIF89a
        else if (header.startsWith('474946383761') || header.startsWith('474946383961')) {
            isValid = true;
            detectedType = 'image/gif';
        }

        if (!isValid) {
          return resolve({ isValid: false, error: 'Invalid file content. File does not match expected image format.' });
        }

        return resolve({ isValid: true, detectedType });
      });
    });
  });
};

const getSafeExtension = (mimeType) => {
  return mimeToExtension[mimeType] || null;
};

module.exports = {
  validateImageFile,
  getSafeExtension,
  mimeToExtension
};
