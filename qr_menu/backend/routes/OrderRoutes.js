const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/menuItems');
const { auth, authorize } = require('../middleware/auth');
// ✅ GET all orders (optionally filter by ?status=placed)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter)
      .populate('table', 'tableNumber') // populate table info
      .populate('items.menuItemId', 'name price')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ PATCH: Update order status
router.patch('/:id/status', auth, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'placed', 'preparing', 'ready', 'served', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('table', 'tableNumber')
      .populate('items.menuItemId', 'name price');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ POST: Place a new order via QR slug (find table by tableNumber)
router.post('/:qrSlug/orders', async (req, res) => {
  try {
    const { qrSlug } = req.params;
    const { items } = req.body;

    // Find the table using tableNumber from slug
    const table = await Table.findOne({ tableNumber: qrSlug });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // 💰 Calculate total price
    const subTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const gst = subTotal * 0.05;
    const totalPrice = subTotal + gst;

    // 📝 Create and save order (store table._id)
    const newOrder = new Order({
      table: table._id, // ✅ using MongoDB _id
      items,
      subTotal,
      gst,
      totalPrice,
      status: 'pending',
    });

    const savedOrder = await newOrder.save();

    await savedOrder.populate('table', 'tableNumber');

    res.status(201).json({
      message: 'Order placed successfully',
      order: savedOrder,
    });
  } catch (err) {
    console.error('❌ Error placing order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET single order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('table', 'tableNumber')
      .populate('items.menuItemId', 'name price');

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
