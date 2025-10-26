// backend/controllers/menu.controller.js
const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/menuItems');
const Table = require('../models/Table');

// @desc    Get all categories
// @route   GET /api/menu/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.find()
      .sort({ displayOrder: 1 })
      .lean();
    
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create category
// @route   POST /api/menu/categories
// @access  Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, displayOrder, active } = req.body;

    const category = await MenuCategory.create({
      name,
      displayOrder: displayOrder || 0,
      active: active !== undefined ? active : true
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update category
// @route   PUT /api/menu/categories/:id
// @access  Admin
exports.updateCategory = async (req, res) => {
  try {
    const { name, displayOrder, active } = req.body;

    const category = await MenuCategory.findByIdAndUpdate(
      req.params.id,
      { name, displayOrder, active },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete category
// @route   DELETE /api/menu/categories/:id
// @access  Admin
exports.deleteCategory = async (req, res) => {
  try {
    // Check if any menu items use this category
    const itemCount = await MenuItem.countDocuments({ categoryId: req.params.id });
    
    if (itemCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category with ${itemCount} items. Reassign items first.` 
      });
    }

    const category = await MenuCategory.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get menu items with filters
// @route   GET /api/menu/items?search=&category=&sort=&page=&limit=
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 50, availability } = req.query;
    
    const query = {};
    
    // Search filter (case-insensitive on name and tags)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      query.categoryId = category;
    }

    // Availability filter
    if (availability !== undefined) {
      query.availability = availability === 'true';
    }
    
    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const items = await MenuItem.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('categoryId', 'name')
      .lean();
    
    const total = await MenuItem.countDocuments(query);
    
    res.json({
      success: true,
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/items/:id
// @access  Public
exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('categoryId', 'name')
      .lean();
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.json({ success: true, item });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create menu item
// @route   POST /api/menu/items
// @access  Admin
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, categoryId, imageUrl, availability, tags } = req.body;

    const item = await MenuItem.create({
      name,
      description,
      price,
      categoryId,
      imageUrl,
      availability: availability !== undefined ? availability : true,
      tags: tags || []
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Admin
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, categoryId, imageUrl, availability, tags } = req.body;

    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price, categoryId, imageUrl, availability, tags },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, item });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Admin
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get menu by table slug
// @route   GET /api/menu/by-table/:slug
// @access  Public
exports.getMenuByTable = async (req, res) => {
  try {
    const table = await Table.findOne({ qrSlug: req.params.slug });
    
    if (!table) {
      return res.status(404).json({ success: false, message: 'Invalid table QR code' });
    }

    const categories = await MenuCategory.find({ active: true })
      .sort({ displayOrder: 1 })
      .lean();

    const items = await MenuItem.find({ availability: true })
      .populate('categoryId', 'name displayOrder')
      .lean();

    res.json({
      success: true,
      table: {
        id: table._id,
        number: table.number
      },
      categories,
      items
    });
  } catch (error) {
    console.error('Get menu by table error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};