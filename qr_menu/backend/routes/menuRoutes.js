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

module.exports = router;