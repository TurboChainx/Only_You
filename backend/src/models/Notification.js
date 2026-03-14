const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  targetType: {
    type: String,
    enum: ['all', 'specific', 'topic'],
    default: 'all'
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  topic: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'scheduled', 'failed'],
    default: 'pending'
  },
  scheduledAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  recipientCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
