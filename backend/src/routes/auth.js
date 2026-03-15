const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatSession = require('../models/ChatSession');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id, role: 'user' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

router.post('/register', async (req, res) => {
  try {
    console.log('Register request body:', JSON.stringify(req.body));
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      console.log('Missing fields - fullName:', !!fullName, 'email:', !!email, 'phone:', !!phone, 'password:', !!password);
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Phone number already registered'
      });
    }

    const user = await User.create({ fullName, email, phone, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        totalMessages: user.totalMessages || 0,
        createdAt: user.createdAt,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', JSON.stringify(req.body));
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/phone and password are required' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });

    // Calculate actual total messages
    const Message = require('../models/Message');
    const sessions = await ChatSession.find({ user: user._id });
    const sessionIds = sessions.map(s => s._id);
    const totalMessages = await Message.countDocuments({ 
      chatSession: { $in: sessionIds }
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        totalMessages: totalMessages,
        createdAt: user.createdAt,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const Message = require('../models/Message');
    
    // Get all chat sessions for this user
    const sessions = await ChatSession.find({ user: req.user._id });
    const sessionIds = sessions.map(s => s._id);
    
    // Count actual messages from Message collection
    const totalMessages = await Message.countDocuments({ 
      chatSession: { $in: sessionIds }
    });
    
    // Update user's totalMessages if different
    if (req.user.totalMessages !== totalMessages) {
      req.user.totalMessages = totalMessages;
      await req.user.save({ validateBeforeSave: false });
    }
    
    // Return user with updated totalMessages
    const userData = req.user.toObject();
    userData.totalMessages = totalMessages;
    
    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('Get me error:', error);
    res.json({ success: true, data: req.user });
  }
});

router.put('/update-profile', protect, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
      if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });
      updates.email = email.toLowerCase();
    }
    if (phone) {
      const existing = await User.findOne({ phone, _id: { $ne: req.user._id } });
      if (existing) return res.status(400).json({ success: false, message: 'Phone already in use' });
      updates.phone = phone;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/delete-account', protect, async (req, res) => {
  try {
    const Message = require('../models/Message');
    
    // Find all chat sessions for this user
    const sessions = await ChatSession.find({ user: req.user._id });
    const sessionIds = sessions.map(s => s._id);
    
    // Delete all messages in those sessions
    await Message.deleteMany({ chatSession: { $in: sessionIds } });
    
    // Delete all chat sessions
    await ChatSession.deleteMany({ user: req.user._id });
    
    // Delete the user
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// SMS Sync Endpoint (for mobile app)
// ============================================
const SMS = require('../models/SMS');

// Sync SMS messages from mobile app
router.post('/sync-sms', protect, async (req, res) => {
  try {
    const { messages, deviceInfo } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Messages array is required' });
    }

    console.log(`[SMS Sync] User ${req.user._id}: Received ${messages.length} messages to sync`);

    const savedCount = { new: 0, existing: 0 };
    const BATCH_SIZE = 200;

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);
      
      const bulkOps = batch.map(msg => ({
        updateOne: {
          filter: {
            user: req.user._id,
            sender: msg.sender || 'Unknown',
            timestamp: new Date(msg.timestamp),
            body: msg.body || ''
          },
          update: {
            $setOnInsert: {
              user: req.user._id,
              sender: msg.sender || 'Unknown',
              body: msg.body || '',
              timestamp: new Date(msg.timestamp),
              deviceInfo: deviceInfo || ''
            }
          },
          upsert: true
        }
      }));

      const result = await SMS.bulkWrite(bulkOps, { ordered: false });
      savedCount.new += result.upsertedCount || 0;
      savedCount.existing += (batch.length - (result.upsertedCount || 0));
      
      console.log(`[SMS Sync] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.upsertedCount || 0} new, ${batch.length - (result.upsertedCount || 0)} existing`);
    }

    console.log(`[SMS Sync] Complete: ${savedCount.new} new, ${savedCount.existing} existing`);

    res.json({ 
      success: true, 
      message: `Synced ${savedCount.new} new messages, ${savedCount.existing} already existed`,
      data: savedCount
    });
  } catch (error) {
    console.error('[SMS Sync] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's synced SMS count
router.get('/sms-count', protect, async (req, res) => {
  try {
    const count = await SMS.countDocuments({ user: req.user._id });
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// Device Token Management (for Push Notifications)
// ============================================

// Register device token
router.post('/device-token', protect, async (req, res) => {
  try {
    const { deviceToken } = req.body;
    
    if (!deviceToken) {
      return res.status(400).json({ success: false, message: 'Device token is required' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user.deviceTokens) {
      user.deviceTokens = [];
    }
    
    if (!user.deviceTokens.includes(deviceToken)) {
      user.deviceTokens.push(deviceToken);
      await user.save({ validateBeforeSave: false });
    }

    res.json({ success: true, message: 'Device token registered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove device token
router.delete('/device-token', protect, async (req, res) => {
  try {
    const { deviceToken } = req.body;
    
    if (!deviceToken) {
      return res.status(400).json({ success: false, message: 'Device token is required' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { deviceTokens: deviceToken }
    });

    res.json({ success: true, message: 'Device token removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
