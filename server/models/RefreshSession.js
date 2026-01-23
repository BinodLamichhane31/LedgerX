const mongoose = require('mongoose');

const refreshSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    },
    revokedAt: {
      type: Date,
      default: null
    },
    ip: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      required: true
    }
  },
  {
    timestamps: false
  }
);

// Compound index for efficient queries
refreshSessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

// TTL index to automatically delete expired sessions after 7 days
refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model('RefreshSession', refreshSessionSchema);
