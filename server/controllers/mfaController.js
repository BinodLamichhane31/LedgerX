const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { encrypt, decrypt } = require("../utils/encryption");

const hashCodes = async (codes) => {
    return Promise.all(codes.map(code => bcrypt.hash(code, 10)));
};

exports.setupMFA = async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({
            length: 20,
            name: `${process.env.APP_NAME || 'LedgerX'}:${req.user.email}`,
            issuer: process.env.APP_NAME || 'LedgerX'
        });

        // Store temp secret
        // Store temp secret
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        
        // Initialize mfa object if it doesn't exist
        if (!user.mfa) {
            user.mfa = { enabled: false };
        }
        
        user.mfa.tempSecret = encrypt(secret.base32);
        user.markModified('mfa');
        await user.save();
        console.log("MFA SETUP: Saved tempSecret for user:", user._id);

        // Generate QR Code
        QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) return res.status(500).json({ success: false, message: "Error generating QR code" });
            
            res.json({
                success: true,
                message: "MFA setup initiated",
                secret: secret.base32, 
                qrCode: data_url
            });
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifySetup = async (req, res) => {
    const { code } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user.mfa || !user.mfa.tempSecret) {
            console.log("MFA VERIFY: No tempSecret found. User MFA object:", user.mfa);
            return res.status(400).json({ success: false, message: "MFA setup not initiated" });
        }

        let decryptedSecret;
        try {
            decryptedSecret = decrypt(user.mfa.tempSecret);
            console.log("MFA VERIFY: Decryption successful");
        } catch (error) {
            console.error("MFA VERIFY: Decryption error:", error.message);
            return res.status(400).json({ success: false, message: "Decryption failed" });
        }

        console.log("MFA VERIFY: Attempting verification with code:", code);
        console.log("MFA VERIFY: Secret length:", decryptedSecret?.length);
        
        // Try with window to account for time drift
        const verifyResult = speakeasy.totp.verifyDelta({
            secret: decryptedSecret,
            encoding: "base32",
            token: code,
            window: 2 // Allow 2 steps before/after (±60 seconds)
        });

        console.log("MFA VERIFY: Verification result:", verifyResult);

        if (!verifyResult || verifyResult.delta === undefined) {
            console.log("MFA VERIFY: Token verification failed");
            return res.status(400).json({ success: false, message: "Invalid token. Please try again or check your device time." });
        }

        // Generate Recovery Codes
        const recoveryCodes = Array.from({ length: 10 }, () => 
            Math.random().toString(36).substring(2, 10).toUpperCase()
        );
        const hashedRecoveryCodes = await hashCodes(recoveryCodes);

        // Commit MFA
        user.mfa.enabled = true;
        user.mfa.secret = encrypt(decryptedSecret); 
        user.mfa.tempSecret = undefined;
        user.mfa.recoveryCodes = hashedRecoveryCodes;
        user.mfa.lastTotpStep = Math.floor(Date.now() / 30000); // Initialize step
        await user.save();

        res.json({
            success: true,
            message: "MFA enabled successfully",
            recoveryCodes: recoveryCodes 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.disableMFA = async (req, res) => {
    const { password, code } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId).select("+password");
        
        // 1. Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        // 2. Verify TOTP
        try {
            const decryptedSecret = decrypt(user.mfa.secret);
            const verified = speakeasy.totp.verify({
                secret: decryptedSecret,
                encoding: "base32",
                token: code
            });

            if (!verified) {
                return res.status(400).json({ success: false, message: "Invalid TOTP code" });
            }
        } catch (err) {
             return res.status(400).json({ success: false, message: "Invalid TOTP code" });
        }

        // Disable
        user.mfa.enabled = false;
        user.mfa.secret = undefined;
        user.mfa.recoveryCodes = [];
        await user.save();

        res.json({ success: true, message: "MFA disabled successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
