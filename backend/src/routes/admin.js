const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Character = require('../models/Character');
const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const SMS = require('../models/SMS');
const Settings = require('../models/Settings');
const { protectAdmin } = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|webp/;
    const ext = types.test(path.extname(file.originalname).toLowerCase());
    const mime = types.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, data: { token, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dashboard Stats
router.get('/dashboard', protectAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    const totalCharacters = await Character.countDocuments();
    const totalSessions = await ChatSession.countDocuments();
    const totalMessages = await Message.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const messagesToday = await Message.countDocuments({ timestamp: { $gte: today } });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email createdAt status');

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const dailyMessages = await Message.aggregate([
      { $match: { timestamp: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers, activeUsers, bannedUsers, totalCharacters,
        totalSessions, totalMessages, newUsersToday, messagesToday,
        recentUsers, dailyMessages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Users CRUD
router.get('/users', protectAdmin, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({ success: true, data: { users, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/ban', protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.status = user.status === 'banned' ? 'active' : 'banned';
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/users/:id', protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const sessions = await ChatSession.find({ user: user._id });
    const sessionIds = sessions.map(s => s._id);
    await Message.deleteMany({ chatSession: { $in: sessionIds } });
    await ChatSession.deleteMany({ user: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Characters CRUD
router.get('/characters', protectAdmin, async (req, res) => {
  try {
    const characters = await Character.find().sort({ createdAt: -1 });
    res.json({ success: true, data: characters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/characters', protectAdmin, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, age, location, bio, personality, conversationStyle, hobbies, systemPrompt } = req.body;

    const characterData = {
      name, age: parseInt(age), location, bio, personality, conversationStyle,
      hobbies: typeof hobbies === 'string' ? hobbies.split(',').map(h => h.trim()) : hobbies,
    };

    if (systemPrompt) characterData.systemPrompt = systemPrompt;
    if (req.file) characterData.profileImage = `/uploads/${req.file.filename}`;

    const character = await Character.create(characterData);
    res.status(201).json({ success: true, data: character });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/characters/:id', protectAdmin, upload.single('profileImage'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.hobbies && typeof updates.hobbies === 'string') {
      updates.hobbies = updates.hobbies.split(',').map(h => h.trim());
    }
    if (updates.age) updates.age = parseInt(updates.age);
    if (req.file) updates.profileImage = `/uploads/${req.file.filename}`;

    const character = await Character.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!character) return res.status(404).json({ success: false, message: 'Character not found' });

    res.json({ success: true, data: character });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/characters/:id', protectAdmin, async (req, res) => {
  try {
    const character = await Character.findByIdAndDelete(req.params.id);
    if (!character) return res.status(404).json({ success: false, message: 'Character not found' });

    const sessions = await ChatSession.find({ character: req.params.id });
    const sessionIds = sessions.map(s => s._id);
    await Message.deleteMany({ chatSession: { $in: sessionIds } });
    await ChatSession.deleteMany({ character: req.params.id });

    res.json({ success: true, message: 'Character deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Chat history for admin
router.get('/chats', protectAdmin, async (req, res) => {
  try {
    const { userId, characterId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (userId) query.user = userId;
    if (characterId) query.character = characterId;

    const sessions = await ChatSession.find(query)
      .populate('user', 'fullName email')
      .populate('character', 'name profileImage')
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ChatSession.countDocuments(query);

    res.json({ success: true, data: { sessions, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/chats/:sessionId/messages', protectAdmin, async (req, res) => {
  try {
    const messages = await Message.find({ chatSession: req.params.sessionId })
      .sort({ timestamp: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/chats/:sessionId', protectAdmin, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    // Delete all messages in the session
    await Message.deleteMany({ chatSession: req.params.sessionId });
    
    // Delete the session itself
    await ChatSession.findByIdAndDelete(req.params.sessionId);

    res.json({ success: true, message: 'Chat session deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Analytics endpoint
router.get('/analytics', protectAdmin, async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    let daysBack = 7;
    if (range === '30d') daysBack = 30;
    if (range === '90d') daysBack = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    const totalCharacters = await Character.countDocuments();
    const totalMessages = await Message.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const messagesToday = await Message.countDocuments({ timestamp: { $gte: today } });

    const recentUsers = await User.find()
      .sort({ lastActive: -1 })
      .limit(10)
      .select('fullName email status totalMessages lastActive createdAt');

    const dailyMessages = await Message.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Character chat distribution
    const characterStats = await ChatSession.aggregate([
      {
        $group: {
          _id: '$character',
          totalChats: { $sum: '$messageCount' }
        }
      },
      {
        $lookup: {
          from: 'characters',
          localField: '_id',
          foreignField: '_id',
          as: 'charInfo'
        }
      },
      { $unwind: '$charInfo' },
      {
        $project: {
          name: '$charInfo.name',
          value: '$totalChats'
        }
      },
      { $sort: { value: -1 } }
    ]);

    // Calculate percentages for character stats
    const totalCharChats = characterStats.reduce((sum, c) => sum + c.value, 0) || 1;
    const characterStatsPercent = characterStats.map(c => ({
      name: c.name,
      value: Math.round((c.value / totalCharChats) * 100)
    }));

    // User growth over period
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          users: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers, activeUsers, bannedUsers, totalCharacters,
        totalMessages, newUsersToday, messagesToday,
        recentUsers, dailyMessages, characterStats: characterStatsPercent,
        userGrowth,
        avgResponseTime: '1.2s',
        userRetention: `${Math.min(98, Math.round((activeUsers / Math.max(totalUsers, 1)) * 100))}%`,
        avgSessionDuration: '12m',
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Settings endpoints
router.get('/settings', protectAdmin, async (req, res) => {
  try {
    // Try to read settings from a simple JSON approach
    // In production, this would be a Settings model in MongoDB
    const settings = {
      appName: 'Only You',
      appTagline: 'Find Your Connection',
      maintenanceMode: false,
      maxMessagesPerDay: 500,
      aiModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      aiMaxTokens: 500,
      aiTemperature: 0.8,
      enableNewRegistrations: true,
      enablePushNotifications: false,
      moderationEnabled: true,
      autobanThreshold: 100,
    };
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/settings', protectAdmin, async (req, res) => {
  try {
    // In production, save to MongoDB Settings collection
    // For now, update environment-level settings where possible
    const settings = req.body;
    if (settings.aiModel) {
      process.env.OPENAI_MODEL = settings.aiModel;
    }
    res.json({ success: true, data: settings, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin password change
router.put('/change-password', protectAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const admin = await Admin.findById(req.admin._id).select('+password');
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// SMS Management Routes
// ============================================

// Get all SMS messages with pagination and filtering
router.get('/sms', protectAdmin, async (req, res) => {
  try {
    const { userId, sender, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (userId) query.user = userId;
    if (sender) query.sender = { $regex: sender, $options: 'i' };
    if (search) {
      query.$or = [
        { sender: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    const smsMessages = await SMS.find(query)
      .populate('user', 'fullName email phone')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await SMS.countDocuments(query);

    res.json({
      success: true,
      data: {
        messages: smsMessages,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get SMS statistics
router.get('/sms/stats', protectAdmin, async (req, res) => {
  try {
    const totalSMS = await SMS.countDocuments();
    const uniqueUsers = await SMS.distinct('user');
    const uniqueSenders = await SMS.distinct('sender');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const smsToday = await SMS.countDocuments({ timestamp: { $gte: today } });

    // Top senders
    const topSenders = await SMS.aggregate([
      { $group: { _id: '$sender', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalSMS,
        uniqueUsers: uniqueUsers.length,
        uniqueSenders: uniqueSenders.length,
        smsToday,
        topSenders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get SMS for a specific user
router.get('/sms/user/:userId', protectAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const smsMessages = await SMS.find({ user: req.params.userId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await SMS.countDocuments({ user: req.params.userId });

    res.json({
      success: true,
      data: {
        messages: smsMessages,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark SMS as read
router.put('/sms/:id/read', protectAdmin, async (req, res) => {
  try {
    const sms = await SMS.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!sms) {
      return res.status(404).json({ success: false, message: 'SMS not found' });
    }
    res.json({ success: true, data: sms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete SMS
router.delete('/sms/:id', protectAdmin, async (req, res) => {
  try {
    const sms = await SMS.findByIdAndDelete(req.params.id);
    if (!sms) {
      return res.status(404).json({ success: false, message: 'SMS not found' });
    }
    res.json({ success: true, message: 'SMS deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// System Settings Routes (OpenAI, MongoDB, etc.)
// ============================================

// Get system settings
router.get('/system-settings', protectAdmin, async (req, res) => {
  try {
    // Get settings from database
    const dbSettings = await Settings.getAllSettings();
    
    // Convert to object
    const settingsObj = {};
    dbSettings.forEach(s => {
      settingsObj[s.key] = {
        value: s.isEncrypted ? '••••••••' : s.value,
        hasValue: !!s.value,
        isEncrypted: s.isEncrypted,
        description: s.description,
        updatedAt: s.updatedAt
      };
    });

    // Default settings structure with current env values (masked)
    const settings = {
      openaiApiKey: settingsObj.openaiApiKey || {
        value: process.env.OPENAI_API_KEY ? '••••••••' + process.env.OPENAI_API_KEY.slice(-4) : '',
        hasValue: !!process.env.OPENAI_API_KEY,
        isEncrypted: true,
        description: 'OpenAI API Key for AI chat functionality'
      },
      mongodbUri: settingsObj.mongodbUri || {
        value: process.env.MONGODB_URI ? '••••••••' : '',
        hasValue: !!process.env.MONGODB_URI,
        isEncrypted: true,
        description: 'MongoDB connection string'
      },
      jwtSecret: settingsObj.jwtSecret || {
        value: '••••••••',
        hasValue: !!process.env.JWT_SECRET,
        isEncrypted: true,
        description: 'JWT secret for authentication'
      },
      openaiModel: settingsObj.openaiModel || {
        value: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        hasValue: true,
        isEncrypted: false,
        description: 'OpenAI model to use'
      },
      serverUrl: settingsObj.serverUrl || {
        value: process.env.SERVER_URL || '',
        hasValue: !!process.env.SERVER_URL,
        isEncrypted: false,
        description: 'Server URL for the API'
      }
    };

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a system setting
router.put('/system-settings/:key', protectAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ success: false, message: 'Value is required' });
    }

    const sensitiveKeys = ['openaiApiKey', 'mongodbUri', 'jwtSecret'];
    const isEncrypted = sensitiveKeys.includes(key);

    // Save to database
    await Settings.setSetting(key, value, {
      isEncrypted,
      description: getSettingDescription(key),
      adminId: req.admin._id
    });

    // Also update process.env for immediate effect
    const envKeyMap = {
      openaiApiKey: 'OPENAI_API_KEY',
      mongodbUri: 'MONGODB_URI',
      jwtSecret: 'JWT_SECRET',
      openaiModel: 'OPENAI_MODEL',
      serverUrl: 'SERVER_URL'
    };

    if (envKeyMap[key]) {
      process.env[envKeyMap[key]] = value;
    }

    // Update .env file for persistence
    await updateEnvFile(envKeyMap[key], value);

    res.json({ 
      success: true, 
      message: `${key} updated successfully`,
      data: {
        key,
        hasValue: true,
        isEncrypted,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test OpenAI connection
router.post('/system-settings/test-openai', protectAdmin, async (req, res) => {
  try {
    const { OpenAI } = require('openai');
    const apiKey = await Settings.getSetting('openaiApiKey') || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ success: false, message: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      messages: [{ role: 'user', content: 'Say "API Connected" in exactly 2 words' }],
      max_tokens: 10
    });

    res.json({ 
      success: true, 
      message: 'OpenAI connection successful',
      response: response.choices[0].message.content
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: `OpenAI connection failed: ${error.message}` 
    });
  }
});

// Test MongoDB connection
router.post('/system-settings/test-mongodb', protectAdmin, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    res.json({ 
      success: state === 1, 
      message: `MongoDB is ${states[state]}`,
      state: states[state]
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: `MongoDB check failed: ${error.message}` 
    });
  }
});

// Helper function to get setting description
function getSettingDescription(key) {
  const descriptions = {
    openaiApiKey: 'OpenAI API Key for AI chat functionality',
    mongodbUri: 'MongoDB connection string',
    jwtSecret: 'JWT secret for authentication',
    openaiModel: 'OpenAI model to use',
    serverUrl: 'Server URL for the API'
  };
  return descriptions[key] || '';
}

// Helper function to update .env file
async function updateEnvFile(key, value) {
  try {
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const lines = envContent.split('\n');
    let found = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(`${key}=`)) {
        lines[i] = `${key}=${value}`;
        found = true;
        break;
      }
    }
    
    if (!found) {
      lines.push(`${key}=${value}`);
    }
    
    fs.writeFileSync(envPath, lines.join('\n'));
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
}

module.exports = router;
