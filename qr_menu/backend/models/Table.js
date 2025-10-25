const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', // assuming you'll create an Order model
    default: null
  }
});

module.exports = mongoose.model('Table', tableSchema);
