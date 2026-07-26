const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  title: String,
  description: String,
  uploadedBy: String,
  fileName: String,
  mimeType: String,
  pdfData: Buffer,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Material", materialSchema);
