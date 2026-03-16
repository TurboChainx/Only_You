const mongoose = require('mongoose');

const userDeviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  deviceName: {
    type: String,
    default: 'Unknown Device'
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web', 'unknown'],
    default: 'unknown'
  },
  appVersion: {
    type: String,
    default: '1.0.0'
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  networkType: {
    type: String,
    default: ''
  },
  isForeground: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  loginAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index: one device entry per user+deviceId
userDeviceSchema.index({ user: 1, deviceId: 1 }, { unique: true });
// For querying online devices
userDeviceSchema.index({ status: 1, lastActive: -1 });

module.exports = mongoose.model('UserDevice', userDeviceSchema);
