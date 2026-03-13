const express = require('express');
const Character = require('../models/Character');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const characters = await Character.find({ isActive: true })
      .select('-systemPrompt')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: characters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id).select('-systemPrompt');

    if (!character) {
      return res.status(404).json({ success: false, message: 'Character not found' });
    }

    res.json({ success: true, data: character });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
