const bcrypt = require('bcrypt');

/**
 * Check if a new password matches any password in the history
 * @param {string} newPassword - The plain text password to check
 * @param {Array<string>} passwordHistory - Array of hashed passwords
 * @returns {Promise<boolean>} - True if password was used before, false otherwise
 */
const checkPasswordHistory = async (newPassword, passwordHistory) => {
  if (!passwordHistory || passwordHistory.length === 0) {
    return false;
  }

  for (const hashedPassword of passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, hashedPassword);
    if (isMatch) {
      return true;
    }
  }

  return false;
};

/**
 * Add a new password hash to history and maintain the limit
 * @param {string} hashedPassword - The hashed password to add
 * @param {Array<string>} currentHistory - Current password history array
 * @param {number} limit - Maximum number of passwords to keep in history
 * @returns {Array<string>} - Updated password history
 */
const addToPasswordHistory = (hashedPassword, currentHistory = [], limit = 5) => {
  const updatedHistory = [hashedPassword, ...currentHistory];
  
  // Keep only the most recent N passwords
  if (updatedHistory.length > limit) {
    return updatedHistory.slice(0, limit);
  }
  
  return updatedHistory;
};

/**
 * Check if a password has expired
 * @param {Date} passwordLastUpdated - Timestamp when password was last updated
 * @param {number} expirationDays - Number of days before password expires
 * @returns {boolean} - True if password has expired, false otherwise
 */
const isPasswordExpired = (passwordLastUpdated, expirationDays = 90) => {
  if (!passwordLastUpdated) {
    return false; // If no timestamp, consider it not expired (for backward compatibility)
  }

  const now = new Date();
  const lastUpdated = new Date(passwordLastUpdated);
  const daysSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));

  return daysSinceUpdate >= expirationDays;
};

module.exports = {
  checkPasswordHistory,
  addToPasswordHistory,
  isPasswordExpired
};
