const mongoose = require('mongoose');
require('dotenv').config();
require('./src/config/database')();

setTimeout(async () => {
  try {
    const User = require('./src/models/User');
    
    // Check all users
    const allUsers = await User.find({});
    console.log('=== ALL USERS (' + allUsers.length + ') ===');
    
    // Users with tokens
    const usersWithTokens = await User.find({ deviceTokens: { $exists: true, $ne: [] } });
    console.log('Users with device tokens: ' + usersWithTokens.length);
    usersWithTokens.forEach(u => {
      console.log('  ' + u.fullName + ': ' + u.deviceTokens.length + ' token(s), status=' + u.status);
    });
    
    // Check active users with tokens (this is what notification route uses)
    const activeUsersWithTokens = await User.find({ status: 'active', deviceTokens: { $exists: true, $ne: [] } });
    console.log('ACTIVE users with tokens: ' + activeUsersWithTokens.length);

    // Check notifications collection
    console.log('=== NOTIFICATIONS ===');
    const Notification = require('./src/models/Notification');
    const count = await Notification.countDocuments();
    console.log('Total in DB: ' + count);
    
    // Raw find to see if anything exists
    const raw = await mongoose.connection.db.collection('notifications').find({}).toArray();
    console.log('Raw collection count: ' + raw.length);
    if (raw.length > 0) {
      raw.forEach(n => console.log('  ' + n.title + ' | ' + n.status + ' | success:' + n.successCount + ' fail:' + n.failureCount + ' | ' + n.createdAt));
    }

    // Test FCM send via HTTP API (simulates admin panel)
    console.log('=== TEST VIA HTTP API ===');
    const http = require('http');
    
    // First login
    const loginRes = await new Promise((resolve, reject) => {
      const data = JSON.stringify({ email: 'admin@onlyyou.com', password: 'REDACTED_LOCAL_ADMIN_PASSWORD' });
      const req = http.request({ hostname: 'localhost', port: 5000, path: '/api/admin/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(JSON.parse(body)));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
    console.log('Login: ' + (loginRes.success ? 'OK' : 'FAILED - ' + loginRes.message));
    
    if (loginRes.success && loginRes.data && loginRes.data.token) {
      const token = loginRes.data.token;
      const notifData = JSON.stringify({ title: 'API Test', body: 'Testing from API at ' + new Date().toLocaleTimeString(), targetType: 'all' });
      const notifRes = await new Promise((resolve, reject) => {
        const req = http.request({ hostname: 'localhost', port: 5000, path: '/api/admin/notifications/send', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(notifData), 'Authorization': 'Bearer ' + token } }, res => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(notifData);
        req.end();
      });
      console.log('Notification result: ' + JSON.stringify(notifRes));
    }
    
    console.log('=== DONE ===');
  } catch (e) {
    console.error('Error:', e.message, e.stack);
  }
  process.exit();
}, 3000);
