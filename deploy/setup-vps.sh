#!/bin/bash
# ============================================
# Laurel Live - VPS Setup Script
# Run on Ubuntu VPS: 43.164.192.125
# ============================================

set -e

echo "🚀 Starting Laurel Live VPS Setup..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB 7.0
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/laurel-live
sudo chown -R $USER:$USER /var/www/laurel-live

echo "✅ System dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Upload project files to /var/www/laurel-live/"
echo "2. Run: cd /var/www/laurel-live/backend && npm install"
echo "3. Run: npm run seed"
echo "4. Run: pm2 start src/server.js --name laurel-api"
echo "5. Configure Nginx"
