# After a credential leak on GitHub

If secrets were ever pushed to a public or forked repository, **assume they are compromised** and rotate everything below.

## 1. MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. **Database Access** → edit user `dbforyou` (or your user) → **Edit Password** (or create a new user and update `MONGODB_URI` on the server).
3. **Network Access** → ensure IP allowlist matches your VPS (do not use `0.0.0.0/0` unless you accept the risk).
4. Update `MONGODB_URI` in `backend/.env` on the VPS only (never commit `.env`).

## 2. OpenAI

1. [OpenAI API keys](https://platform.openai.com/api-keys) → **Revoke** the leaked key.
2. Create a **new** key → put it in `backend/.env` on the server (`OPENAI_API_KEY`).

## 3. Google Cloud / Firebase (service account)

1. [Google Cloud Console](https://console.cloud.google.com/) → **IAM & Admin** → **Service Accounts**.
2. Find `firebase-adminsdk-...` for project `only-you-b36ea` (or your project).
3. **Keys** → **Delete** the leaked key → **Add key** → **Create new key** (JSON).
4. Place the new JSON on the server as `backend/src/config/firebase-admin-key.json` (not in Git), **or** set `FIREBASE_SERVICE_ACCOUNT_JSON` in `.env` to the minified JSON string.

## 4. JWT and admin password

- Set a new `JWT_SECRET` in production `.env`.
- Change the admin password in the admin panel after deploy.

## 5. VPS SSH

- If `VPS.txt` was leaked, **change the SSH password** or use SSH keys only and disable password auth.

## 6. Git history

Secrets were removed from the latest commits and rewritten out of history where possible. Anyone who forked or cloned the old repo may still have old data—rotation above still applies.
