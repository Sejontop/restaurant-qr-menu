const express = require("express");
const MenuItem = require("../models/menuItems.js");

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

module.exports = router;