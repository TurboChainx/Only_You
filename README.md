# Laurel Live - Talk & Chat

AI-powered chat application where users can chat with AI characters. Built with React Native (mobile), React (admin panel), and Node.js (backend).

## 📦 Project Structure

```
laurel-live/
├── backend/              # Node.js + Express API
├── admin-panel/          # React admin dashboard
├── mobile/              # React Native Expo app
├── deploy/              # Deployment scripts
└── Fayaz Shaikh_Resource/  # Client resources
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 7.0+
- Expo CLI (for mobile development)

### Backend Setup

```bash
cd backend
npm install
npm run seed    # Seeds database with characters and admin
npm start       # Starts on port 5000
```

**Default Admin Credentials:**
- Email: `admin@laurellive.com`
- Password: `REDACTED_ADMIN_PASSWORD`

### Admin Panel Setup

```bash
cd admin-panel
npm install
npm run dev     # Starts on http://localhost:3001
```

### Mobile App Setup

```bash
cd mobile
npm install
npx expo start  # Opens Expo dev tools
```

**Important:** Update API URL in `mobile/src/services/api.js`:
```javascript
const API_BASE = 'http://YOUR_VPS_IP:5000/api';
```

## 🎨 Features

### Mobile App
- ✅ Splash screen with gradient animation
- ✅ Login/Signup (email/phone + password)
- ✅ Character grid with search
- ✅ Character profile detail page
- ✅ Real-time AI chat with typing indicators
- ✅ Chat history persistence
- ✅ Messages list
- ✅ User profile

### Admin Panel
- ✅ Dashboard with analytics
- ✅ User management (ban/unban/delete)
- ✅ AI character CRUD
- ✅ System prompt management
- ✅ Chat history viewer
- ✅ Beautiful modern UI

### Backend API
- ✅ JWT authentication
- ✅ OpenAI GPT-4.1-mini integration
- ✅ RESTful API design
- ✅ MongoDB with Mongoose
- ✅ File upload support
- ✅ Rate limiting

## 🌐 Deployment to VPS

### 1. Connect to VPS
```bash
ssh ubuntu@43.164.192.125
# Password: REDACTED_SSH_PASSWORD
```

### 2. Run Setup Script
```bash
# Upload project to VPS first
cd /var/www/laurel-live
chmod +x deploy/setup-vps.sh
./deploy/setup-vps.sh
```

### 3. Deploy Application
```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh --seed  # First time only (seeds database)
```

### 4. Access Application
- **Admin Panel:** http://43.164.192.125/
- **API Health:** http://43.164.192.125/api/health

## 📱 Building Mobile APK

### Development Build
```bash
cd mobile
npx expo start
# Press 'a' for Android
```

### Production APK
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview

# Download APK from Expo dashboard
```

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/laurel_live
JWT_SECRET=laurel_live_jwt_secret_key_2024_secure
JWT_EXPIRES_IN=30d
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4.1-mini
ADMIN_EMAIL=admin@laurellive.com
ADMIN_PASSWORD=REDACTED_ADMIN_PASSWORD
```

### Mobile (update in code)
```javascript
// mobile/src/services/api.js
const API_BASE = 'http://43.164.192.125/api';
```

## 👥 AI Characters

The app comes pre-seeded with 5 AI characters:
1. **Olivia Parker** (19, Los Angeles) - Playful, teasing
2. **Emily Walker** (20, Toronto) - Witty, sarcastic
3. **Chloe Bennett** (18, Miami) - Energetic, cheerful
4. **Sophia Mitchell** (19, Vancouver) - Charming, thoughtful
5. **Mia Thompson** (20, Austin) - Friendly, humorous

## 🔐 Permissions (Android)

Required permissions in `app.json`:
- ✅ CAMERA - Profile photos
- ✅ READ_SMS / RECEIVE_SMS - OTP verification
- ✅ CALL_PHONE - Click-to-call
- ✅ READ_PHONE_STATE
- ✅ READ_CONTACTS

**Note:** Google Play may require justification for SMS/Call permissions.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo Router |
| Admin | React + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| AI | OpenAI GPT-4.1-mini |
| Auth | JWT |
| Hosting | Ubuntu VPS + Nginx + PM2 |

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Characters
- `GET /api/characters` - List all characters
- `GET /api/characters/:id` - Get character details

### Chat
- `POST /api/chat/send` - Send message & get AI response
- `GET /api/chat/sessions` - Get user's chat sessions
- `GET /api/chat/history/:characterId` - Get chat history

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `GET /api/admin/characters` - List characters
- `POST /api/admin/characters` - Create character
- `PUT /api/admin/characters/:id` - Update character
- `DELETE /api/admin/characters/:id` - Delete character

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check logs
pm2 logs laurel-api
```

### Mobile app can't connect
1. Update API_BASE URL in `mobile/src/services/api.js`
2. Ensure VPS firewall allows port 5000
3. Check backend is running: `pm2 status`

### Admin panel blank page
```bash
# Rebuild admin panel
cd admin-panel
npm run build
```

## 📝 Notes

- **OpenAI API Key:** Provided by client, already configured
- **VPS Specs:** 2 vCPUs, 4GB RAM, 60GB SSD
- **Budget:** $400 MVP (7-8 days development)
- **Client:** Fayaz P S (US-based)

## 🎯 Future Enhancements

- [ ] Forgot password flow
- [ ] User profile editing
- [ ] Push notifications
- [ ] Voice messages
- [ ] Image sharing in chat
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] iOS version

## 📄 License

Proprietary - Built for Fayaz P S

---

**Built with ❤️ by Ivan K.**
