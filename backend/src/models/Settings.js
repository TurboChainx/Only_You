const mongoose = require('mongoose');
const crypto = require('crypto');

// Encryption key from environment (32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || 'default-32-char-encryption-key!!';
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text || !text.includes(':')) return text;
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return text;
  }
}

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: String,
    required: true
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Static method to get a setting
settingsSchema.statics.getSetting = async function(key) {
  const setting = await this.findOne({ key });
  if (!setting) return null;
  return setting.isEncrypted ? decrypt(setting.value) : setting.value;
};

// Static method to set a setting
settingsSchema.statics.setSetting = async function(key, value, options = {}) {
  const { isEncrypted = false, description = '', adminId = null } = options;
  const storedValue = isEncrypted ? encrypt(value) : value;
  
  return this.findOneAndUpdate(
    { key },
    { 
      value: storedValue, 
      isEncrypted, 
      description,
      lastUpdatedBy: adminId 
    },
    { upsert: true, new: true }
  );
};

// Static method to get all settings (decrypted)
settingsSchema.statics.getAllSettings = async function() {
  const settings = await this.find();
  return settings.map(s => ({
    key: s.key,
    value: s.isEncrypted ? decrypt(s.value) : s.value,
    isEncrypted: s.isEncrypted,
    description: s.description,
    updatedAt: s.updatedAt
  }));
};

module.exports = mongoose.model('Settings', settingsSchema);
