# Quick Start - Local Testing

## First Time Setup (5 minutes)

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Admin Panel
cd ../admin-panel
npm install

# Mobile App
cd ../mobile
npm install
```

### 2. Seed Database
```bash
cd backend
npm run seed
```
This creates 5 AI characters and 1 admin user.

### 3. Start Everything
**Option A: Automatic (Windows)**
Double-click: `start-local-testing.bat`

**Option B: Manual**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Admin Panel
cd admin-panel
npm run dev

# Terminal 3 - Mobile App
cd mobile
npm start
```

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Backend API** | http://localhost:5000 | - |
| **Admin Panel** | http://localhost:5173 | admin@onlyyou.com / REDACTED_LOCAL_ADMIN_PASSWORD |
| **Mobile App** | Expo QR Code | Create account in app |

## Quick Test Flow

1. **Admin Panel** (http://localhost:5173)
   - Login with admin credentials
   - Check Dashboard shows stats
   - View Characters page (should show 5 characters)
   - Test Analytics page

2. **Mobile App** (Expo)
   - Signup with test account
   - Grant permissions (Camera, Call, SMS)
   - Browse characters on Home screen
   - Open a character and start chatting
   - Check Messages screen for chat history

## Troubleshooting

**Backend won't start?**
- Check if port 5000 is free
- Verify MongoDB Atlas connection in `.env`

**Admin panel shows blank?**
- Wait for backend to fully start first
- Check browser console for errors

**Mobile app can't connect?**
- Ensure backend is running on port 5000
- Check `mobile/src/services/api.js` has localhost

**No AI responses?**
- Verify OpenAI API key in `backend/.env`
- Check OpenAI account has credits

## What's Working

✅ Light pink theme throughout mobile app
✅ "Only You" branding everywhere
✅ No social login buttons
✅ Permissions flow after signup
✅ Account deletion with cascade
✅ Admin panel with 8 pages (Dashboard, Users, Characters, Chats, Analytics, Notifications, Content, Settings)
✅ Character image URLs working
✅ Dark theme removed from mobile

## Ready for Production?

After testing locally, see `LOCAL_TESTING_GUIDE.md` for:
- Complete testing checklist
- Deployment preparation steps
- VPS deployment guide

---

**Need help?** Check `LOCAL_TESTING_GUIDE.md` for detailed instructions.
