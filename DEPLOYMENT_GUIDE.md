# 🚀 Laurel Live - Complete Deployment Guide

## Step-by-Step VPS Deployment

### Prerequisites Checklist
- [x] VPS IP: `43.164.192.125`
- [x] SSH User: `ubuntu`
- [x] SSH Password: `REDACTED_SSH_PASSWORD`
- [x] OpenAI API Key: Configured in `.env`
- [x] Project files ready

---

## Phase 1: Upload Project to VPS

### Option A: Using SCP (Recommended)
```bash
# From your local machine
cd "g:\AI Chat Application"

# Create archive
tar -czf laurel-live.tar.gz backend admin-panel deploy

# Upload to VPS
scp laurel-live.tar.gz ubuntu@43.164.192.125:~/

# SSH into VPS
ssh ubuntu@43.164.192.125

# Extract
sudo mkdir -p /var/www/laurel-live
sudo chown -R ubuntu:ubuntu /var/www/laurel-live
tar -xzf ~/laurel-live.tar.gz -C /var/www/laurel-live/
```

### Option B: Using Git
```bash
# On VPS
ssh ubuntu@43.164.192.125
cd /var/www
sudo git clone YOUR_REPO_URL laurel-live
sudo chown -R ubuntu:ubuntu laurel-live
```

### Option C: Using SFTP (FileZilla)
1. Open FileZilla
2. Host: `43.164.192.125`
3. Username: `ubuntu`
4. Password: `REDACTED_SSH_PASSWORD`
5. Port: `22`
6. Upload `backend/`, `admin-panel/`, `deploy/` to `/var/www/laurel-live/`

---

## Phase 2: Initial VPS Setup

```bash
# SSH into VPS
ssh ubuntu@43.164.192.125

# Navigate to project
cd /var/www/laurel-live

# Make scripts executable
chmod +x deploy/*.sh

# Run setup script (installs Node.js, MongoDB, Nginx, PM2)
./deploy/setup-vps.sh
```

**This will install:**
- ✅ Node.js 20.x
- ✅ MongoDB 7.0
- ✅ Nginx
- ✅ PM2 (process manager)

**Time:** ~10-15 minutes

---

## Phase 3: Deploy Application

```bash
# Still on VPS
cd /var/www/laurel-live

# Deploy (first time - includes database seeding)
./deploy/deploy.sh --seed
```

**This will:**
1. Install backend dependencies
2. Seed database with 5 AI characters + admin user
3. Build admin panel
4. Configure Nginx
5. Start backend with PM2

**Time:** ~5 minutes

---

## Phase 4: Verify Deployment

### Test Backend API
```bash
curl http://localhost:5000/api/health
# Expected: {"success":true,"message":"Laurel Live API is running",...}
```

### Test Admin Panel
Open browser: `http://43.164.192.125/`

**Login with:**
- Email: `admin@laurellive.com`
- Password: `REDACTED_ADMIN_PASSWORD`

### Check PM2 Status
```bash
pm2 status
# Should show: laurel-api | online
```

### View Logs
```bash
# Backend logs
pm2 logs laurel-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Phase 5: Configure Mobile App

### Update API URL
Edit `mobile/src/services/api.js`:

```javascript
// Change from localhost to VPS IP
const API_BASE = 'http://43.164.192.125/api';
```

### Test Mobile App Locally
```bash
cd mobile
npx expo start

# Scan QR code with Expo Go app
# Or press 'a' for Android emulator
```

---

## Phase 6: Build for Play Store (AAB) or test APK

`mobile/eas.json` is already configured: **production** = Android App Bundle (`.aab`), **preview** = APK.

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Configure EAS
```bash
cd mobile
eas login  # Use your Expo account
# eas.json is committed; only recreate if missing (must match production = app-bundle)
```

### Build
```bash
# Preview build (APK for testing)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

**Time:** ~15-20 minutes

Download **APK** (preview) or **`.aab`** (production) from the Expo dashboard. For Play Store publication steps, see **`docs/DELIVERY_PACKAGE.md`**.

---

## Phase 7: Post-Deployment Tasks

### 1. Setup SSL (Optional but Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (requires domain name)
sudo certbot --nginx -d yourdomain.com
```

### 2. Configure Firewall
```bash
# Allow HTTP, HTTPS, SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Setup Automatic Backups
```bash
# Create backup script
cat > /var/www/laurel-live/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db laurel_live --out /var/backups/mongodb/$DATE
find /var/backups/mongodb -type d -mtime +7 -exec rm -rf {} +
EOF

chmod +x /var/www/laurel-live/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/laurel-live/backup.sh") | crontab -
```

### 4. Monitor Application
```bash
# View real-time logs
pm2 monit

# Setup PM2 monitoring (optional)
pm2 install pm2-logrotate
```

---

## Common Issues & Solutions

### Issue: Backend won't start
```bash
# Check MongoDB
sudo systemctl status mongod
sudo systemctl start mongod

# Check logs
pm2 logs laurel-api --lines 50
```

### Issue: Nginx 502 Bad Gateway
```bash
# Check backend is running
pm2 status

# Restart backend
pm2 restart laurel-api

# Check Nginx config
sudo nginx -t
sudo systemctl restart nginx
```

### Issue: Mobile app can't connect
1. Verify VPS IP is correct in `api.js`
2. Test API: `curl http://43.164.192.125/api/health`
3. Check firewall: `sudo ufw status`
4. Ensure backend is running: `pm2 status`

### Issue: Database connection failed
```bash
# Check MongoDB status
sudo systemctl status mongod

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

---

## Maintenance Commands

### Update Application
```bash
# Upload new code to VPS
# Then:
cd /var/www/laurel-live
./deploy/deploy.sh  # Without --seed flag
```

### Restart Services
```bash
# Restart backend
pm2 restart laurel-api

# Restart Nginx
sudo systemctl restart nginx

# Restart MongoDB
sudo systemctl restart mongod
```

### View Logs
```bash
# Backend
pm2 logs laurel-api

# Nginx access
sudo tail -f /var/log/nginx/access.log

# Nginx errors
sudo tail -f /var/log/nginx/error.log

# MongoDB
sudo tail -f /var/log/mongodb/mongod.log
```

### Database Management
```bash
# Connect to MongoDB
mongosh

# Use database
use laurel_live

# View collections
show collections

# Count users
db.users.countDocuments()

# View characters
db.characters.find().pretty()
```

---

## Performance Optimization

### Enable Gzip in Nginx
Add to `/etc/nginx/nginx.conf`:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### PM2 Cluster Mode
```bash
pm2 delete laurel-api
pm2 start src/server.js -i 2 --name laurel-api
pm2 save
```

### MongoDB Indexes
Already created in models, but verify:
```bash
mongosh laurel_live
db.users.getIndexes()
db.messages.getIndexes()
```

---

## Security Checklist

- [x] Change default admin password after first login
- [ ] Setup SSL certificate (if domain available)
- [ ] Configure firewall (UFW)
- [ ] Setup MongoDB authentication (production)
- [ ] Enable rate limiting (already in code)
- [ ] Regular backups configured
- [ ] Update system packages regularly
- [ ] Monitor logs for suspicious activity

---

## Support & Contact

**Developer:** Ivan K.
**Client:** Fayaz P S
**VPS:** 43.164.192.125 (2 vCPUs, 4GB RAM, 60GB SSD)

**Useful Links:**
- Admin Panel: http://43.164.192.125/
- API Health: http://43.164.192.125/api/health
- PM2 Docs: https://pm2.keymetrics.io/
- Nginx Docs: https://nginx.org/en/docs/

---

**Deployment Complete! 🎉**
