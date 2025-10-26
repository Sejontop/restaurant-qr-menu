const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// 🟢 Get all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🟢 Get a single table by table number OR qrSlug
router.get('/m/:tableIdentifier', async (req, res) => {
  try {
    const { tableIdentifier } = req.params;

    let table = null;

    // Check if tableIdentifier is a number (like "1")
    if (!isNaN(tableIdentifier)) {
      table = await Table.findOne({ tableNumber: Number(tableIdentifier) });
    } else {
      // Otherwise, treat it as qrSlug (like "cAngetAI")
      table = await Table.findOne({ qrSlug: tableIdentifier });
    }

    // If no table found
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    res.json({ success: true, table });
  } catch (err) {
    console.error('Error fetching table by identifier:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// 🟢 Add a new table
router.post('/', async (req, res) => {
  try {
    const { tableNumber, qrSlug } = req.body;
    if (!tableNumber) {
      return res.status(400).json({ message: 'tableNumber is required' });
    }

    // prevent duplicates
    const existing = await Table.findOne({ tableNumber });
    if (existing) {
      return res.status(400).json({ message: 'Table already exists' });
    }

    const table = new Table({ tableNumber, qrSlug });
    await table.save();
    res.status(201).json(table);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🟡 Update table (e.g., mark occupied, add currentOrder)
router.put('/:id', async (req, res) => {
  try {
    const updatedTable = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedTable) return res.status(404).json({ message: 'Table not found' });

    res.json(updatedTable);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔴 Delete a table
router.delete('/:id', async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ message: 'Table deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
