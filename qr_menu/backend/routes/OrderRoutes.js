const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table'); // assuming you have a Table model
const MenuItem = require('../models/menuItems'); // assuming you have a MenuItem model

// ✅ GET all orders with full details
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('table')
      .populate('items.menuItem');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ POST: Place a new order for a table via QR slug
// POST http://localhost:3000/api/menu/:qrSlug/orders
router.post('/:qrSlug/orders', async (req, res) => {
  try {
    const { qrSlug } = req.params;
    const { tableId, items } = req.body;

    // 🧠 Find table by qrSlug or use tableId (whichever is available)
    let table = null;
    if (qrSlug) {
      table = await Table.findOne({ tableNumber :qrSlug });
    } else if (tableId) {
      table = await Table.findById(tableId);
    }

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // 💰 Calculate total price
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    // 📝 Create order
    const newOrder = new Order({
      table: table._id,
      items: items.map(i => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        note: i.note
      })),
      totalPrice
    });

    const savedOrder = await newOrder.save();
    await savedOrder.populate('table');

    res.status(201).json({
      message: 'Order placed successfully',
      order: savedOrder
    });
  } catch (err) {
    console.error('❌ Error placing order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ NEW: GET single order by ID (for frontend display)
// GET http://localhost:3000/api/menu/orders/:orderId
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('table')
      .populate('items.menuItemId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error('❌ Error fetching order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
