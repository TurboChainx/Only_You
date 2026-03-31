SECRETS BACKUP — upload this entire folder to Google Drive (private), then delete from this PC if you prefer.

Files copied here before removal from Git (if they existed):
- firebase-admin-key.json (backend)
- Fayaz Shaikh_Resource OpenAI / Firebase / google-services / VPS

After uploading to Drive:
1. Rotate ALL leaked credentials (MongoDB Atlas user password, OpenAI API key, Firebase service account key in Google Cloud Console, JWT secret).
2. Deploy new firebase-admin-key.json only on your server (not in Git).
3. Keep backend/.env only on the server with real values.

See docs/SECURITY_ROTATION.md in the repo after commit.
