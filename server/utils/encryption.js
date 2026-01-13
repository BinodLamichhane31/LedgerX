const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

if (!ENCRYPTION_KEY) {
    console.warn("WARNING: ENCRYPTION_KEY not set in environment variables. Encryption will fail.");
}

function encrypt(text) {
    if (!text) return text;
    if (!ENCRYPTION_KEY) return text; // Fallback or throw error? For now fallback to avoid crash, but warn.

    try {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error("Encryption Error:", error);
        return text;
    }
}

function decrypt(text) {
    if (!text) return text;
    if (!ENCRYPTION_KEY) return text;

    try {
        let textParts = text.split(':');
        if (textParts.length < 2) return text; // Look like it's not encrypted ?? (Migration strategy)
        
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        return text; 
    }
}

function hash(text) {
    if (!text) return text;
    return crypto.createHash('sha256').update(text).digest('hex');
}

module.exports = { encrypt, decrypt, hash };
