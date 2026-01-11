const mongoose = require("mongoose");

const SystemLogSchema = new mongoose.Schema(
  {
    level: String,
    message: mongoose.Schema.Types.Mixed, 
    meta: mongoose.Schema.Types.Mixed,
    timestamp: Date,
    stack: String,
  },
  { collection: "SystemLog" } 
);

module.exports = mongoose.model("SystemLog", SystemLogSchema);
