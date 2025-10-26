// backend/controllers/table.controller.js
const Table = require('../models/Table');
const QRCode = require('qrcode');
const crypto = require('crypto');

// @desc    Create table
// @route   POST /api/tables
// @access  Admin
exports.createTable = async (req, res) => {
  try {
    const { number, qrSlug } = req.body;

    // Generate random slug if not provided
    const slug = qrSlug || `table-${number}-${crypto.randomBytes(4).toString('hex')}`;

    // Check if table number already exists
    const existingTable = await Table.findOne({ number });
    if (existingTable) {
      return res.status(400).json({ 
        success: false, 
        message: 'Table number already exists' 
      });
    }

    const table = await Table.create({
      number,
      qrSlug: slug
    });

    res.status(201).json({ success: true, table });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all tables
// @route   GET /api/tables
// @access  Admin/Staff
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find()
      .sort({ number: 1 })
      .lean();
    
    res.json({ success: true, tables });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Generate QR code for table
// @route   GET /api/tables/:id/qr
// @access  Admin
exports.getTableQR = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    // Generate QR code URL - points to your frontend menu page
    const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/m/${table.qrSlug}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCodeUrl: qrCodeDataUrl,
      menuUrl,
      table: {
        id: table._id,
        number: table.number,
        qrSlug: table.qrSlug
      }
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get table by slug (for QR scan)
// @route   GET /api/tables/slug/:slug
// @access  Public
exports.getTableBySlug = async (req, res) => {
  try {
    const table = await Table.findOne({ qrSlug: req.params.slug });
    
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid QR code' 
      });
    }

    res.json({
      success: true,
      table: {
        id: table._id,
        number: table.number,
        qrSlug: table.qrSlug
      }
    });
  } catch (error) {
    console.error('Get table by slug error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};