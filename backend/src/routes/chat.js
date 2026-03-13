const express = require('express');
const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const Character = require('../models/Character');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { generateResponse } = require('../services/openaiService');

const router = express.Router();

router.post('/send', protect, async (req, res) => {
  try {
    const { characterId, message } = req.body;

    if (!characterId || !message) {
      return res.status(400).json({ success: false, message: 'Character ID and message are required' });
    }

    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({ success: false, message: 'Character not found' });
    }

    let session = await ChatSession.findOne({
      user: req.user._id,
      character: characterId
    });

    if (!session) {
      session = await ChatSession.create({
        user: req.user._id,
        character: characterId
      });
      character.totalChats += 1;
      await character.save();
    }

    const userMessage = await Message.create({
      chatSession: session._id,
      sender: 'user',
      content: message
    });

    const recentMessages = await Message.find({ chatSession: session._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    const chatHistory = recentMessages.reverse();

    const aiResponseText = await generateResponse(character.systemPrompt, chatHistory);

    const aiMessage = await Message.create({
      chatSession: session._id,
      sender: 'ai',
      content: aiResponseText
    });

    session.lastMessage = aiResponseText;
    session.lastMessageAt = Date.now();
    session.messageCount += 2;
    await session.save();

    req.user.totalMessages += 2;
    await req.user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: {
        userMessage: {
          _id: userMessage._id,
          sender: 'user',
          content: userMessage.content,
          timestamp: userMessage.timestamp
        },
        aiMessage: {
          _id: aiMessage._id,
          sender: 'ai',
          content: aiMessage.content,
          timestamp: aiMessage.timestamp
        }
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .populate('character', 'name age profileImage isOnline')
      .sort({ lastMessageAt: -1 });

    // Filter out sessions where character was deleted (null after populate)
    const validSessions = sessions.filter(session => session.character !== null);

    res.json({ success: true, data: validSessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/history/:characterId', protect, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      user: req.user._id,
      character: req.params.characterId
    });

    if (!session) {
      return res.json({ success: true, data: [] });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chatSession: session._id })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
