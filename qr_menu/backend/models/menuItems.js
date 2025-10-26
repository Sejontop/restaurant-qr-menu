const mongoose = require("mongoose");
const { URL } = require("url");

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String, 
    categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MenuCategory',
    required: true 
  },
  availability: { type: Boolean, default: true },
  imageUrl:{type: String , default: null},
  tags: [String]
}, { timestamps: true });

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;
