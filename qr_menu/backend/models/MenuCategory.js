const mongoose = require("mongoose");

const menuCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });
// Index for quick sorting
menuCategorySchema.index({ displayOrder: 1, active: 1 });

module.exports = mongoose.model('MenuCategory', menuCategorySchema);

