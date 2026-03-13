#!/bin/bash
# ============================================
# Only You Dating App - Deploy Script
# Run from project root on VPS
# ============================================

set -e

APP_DIR="/var/www/onlyyou"

echo "🚀 Deploying Only You Dating App..."

# Backend
echo "📦 Setting up Backend..."
cd $APP_DIR/backend
npm install --production
mkdir -p uploads

# Seed database (only first time)
if [ "$1" == "--seed" ]; then
    echo "🌱 Seeding database..."
    npm run seed
fi

# Admin Panel
echo "📦 Building Admin Panel..."
cd $APP_DIR/admin-panel
npm install
npm run build

# Configure Nginx
echo "🔧 Configuring Nginx..."
sudo cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/onlyyou
sudo ln -sf /etc/nginx/sites-available/onlyyou /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Start/Restart backend with PM2
echo "🔄 Starting Backend..."
cd $APP_DIR/backend
pm2 stop onlyyou-api 2>/dev/null || true
pm2 start src/server.js --name onlyyou-api --env production
pm2 save

# Setup PM2 startup
pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Admin Panel: http://43.164.192.125/"
echo "🔌 API: http://43.164.192.125/api/health"
echo ""
echo "Admin Login:"
echo "  Email: admin@onlyyou.com"
echo "  Password: REDACTED_LOCAL_ADMIN_PASSWORD"
echo ""
echo "📱 Mobile app API is already configured for: http://43.164.192.125/api"
