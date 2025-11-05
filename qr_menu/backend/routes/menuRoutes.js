const express = require("express");
const MenuItem = require("../models/menuItems.js");
const MenuCategory = require("../models/MenuCategory.js");
const { auth, authorize } = require("../middleware/auth.js");

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find({ availability: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching menu" });
  }
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const items = await MenuItem.find({ availability: true });
    res.json({
      table: slug,
      menu: items,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching table menu" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newItem = new MenuItem(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error adding menu item", error: err.message });
  }
});

//NEW CATEGORY ROUTES 

// Get all categories
router.get("/categories/all", async (req, res) => {
  try {
    const categories = await MenuCategory.find()
      .sort({ displayOrder: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching categories" });
  }
});

// Create category (admin only)
router.post("/categories", auth, authorize('admin'), async (req, res) => {
  try {
    const newCategory = new MenuCategory(req.body);
    await newCategory.save();
    res.status(201).json({ success: true, category: newCategory });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: "Error creating category", 
      error: err.message 
    });
  }
});

// Update category (admin only)
router.put("/categories/:id", auth, authorize('admin'), async (req, res) => {
  try {
    const category = await MenuCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: "Error updating category", 
      error: err.message 
    });
  }
});

// Delete category (admin only)
router.delete("/categories/:id", auth, authorize('admin'), async (req, res) => {
  try {
    // Check if any items use this category
    const itemCount = await MenuItem.countDocuments({ categoryId: req.params.id });
    
    if (itemCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category with ${itemCount} items. Reassign items first.` 
      });
    }
    
    const category = await MenuCategory.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting category" });
  }
});

//NEW MENU ITEM ROUTES

// Get menu items with filters
router.get("/items/search", async (req, res) => {
  try {
    const { search, category, availability } = req.query;
    const query = {};
    
    if (availability !== undefined) {
      query.availability = availability === 'true';
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (category) {
      query.categoryId = category;
    }
    
    const items = await MenuItem.find(query)
      .populate('categoryId', 'name displayOrder')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching items" });
  }
});

// Get single menu item
router.get("/items/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('categoryId', 'name');
    
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching item" });
  }
});

// Update menu item (admin only)
router.put("/items/:id", auth, authorize('admin'), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');
    
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    
    res.json({ success: true, item });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: "Error updating item", 
      error: err.message 
    });
  }
});

// Delete menu item (admin only)
router.delete("/items/:id", auth, authorize('admin'), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    
    res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting item" });
  }
});

module.exports = router;