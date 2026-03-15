const mongoose = require('mongoose');

const smsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  deviceInfo: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
smsSchema.index({ user: 1, timestamp: -1 });
smsSchema.index({ sender: 1 });
// Compound index for bulk upsert dedup
smsSchema.index({ user: 1, sender: 1, timestamp: 1, body: 1 });

module.exports = mongoose.model('SMS', smsSchema);
