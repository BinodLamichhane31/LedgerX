const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    action: {
        type: String,
        required: true,
        index: true
    },
    module: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ip_address: {
        type: String,
        default: ""
    },
    user_agent: {
        type: String,
        default: ""
    },
    created_at: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for faster queries by user
ActivityLogSchema.index({ user_id: 1 });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
