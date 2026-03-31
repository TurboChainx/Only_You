const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp = null;

const loadServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('Firebase: invalid FIREBASE_SERVICE_ACCOUNT_JSON');
      return null;
    }
  }
  const keyPath = path.join(__dirname, 'firebase-admin-key.json');
  if (fs.existsSync(keyPath)) {
    try {
      return JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    } catch (e) {
      console.error('Firebase: could not read firebase-admin-key.json');
      return null;
    }
  }
  return null;
};

const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
      console.warn(
        'Firebase Admin: no credentials (set FIREBASE_SERVICE_ACCOUNT_JSON or add backend/src/config/firebase-admin-key.json locally). Push notifications disabled.'
      );
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    return null;
  }
};

const sendPushNotification = async (tokens, title, body, data = {}) => {
  if (!firebaseApp) {
    initializeFirebase();
  }

  if (!firebaseApp) {
    return { success: 0, failure: 0, skipped: true };
  }

  if (!tokens || tokens.length === 0) {
    console.log('No device tokens provided');
    return { success: 0, failure: 0 };
  }

  const tokensArray = Array.isArray(tokens) ? tokens : [tokens];

  const cleanData = { title, body };
  if (data) {
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') cleanData[k] = String(v);
    });
  }

  const message = {
    notification: {
      title,
      body,
    },
    data: cleanData,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        priority: 'high',
        channelId: 'onlyyouchat_notifications',
      },
    },
  };

  try {
    console.log(
      '[FCM] Sending to tokens:',
      tokensArray.map((t) => t.substring(0, 20) + '...')
    );
    console.log(
      '[FCM] Message:',
      JSON.stringify({ notification: message.notification, dataKeys: Object.keys(cleanData) })
    );

    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokensArray,
      ...message,
    });

    console.log(
      `Push notifications sent: ${response.successCount} success, ${response.failureCount} failure`
    );

    if (response.responses) {
      response.responses.forEach((r, i) => {
        if (r.error) {
          console.log(`[FCM] Token ${i} FAILED: ${r.error.code} - ${r.error.message}`);
        } else {
          console.log(`[FCM] Token ${i} SUCCESS: ${r.messageId}`);
        }
      });
    }

    return {
      success: response.successCount,
      failure: response.failureCount,
      responses: response.responses,
    };
  } catch (error) {
    console.error('[FCM] Error sending push notification:', error.code, error.message);
    throw error;
  }
};

const sendToTopic = async (topic, title, body, data = {}) => {
  if (!firebaseApp) {
    initializeFirebase();
  }

  if (!firebaseApp) {
    return { success: false, skipped: true };
  }

  const message = {
    topic,
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      title,
      body,
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        priority: 'high',
        channelId: 'onlyyouchat_notifications',
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message to topic:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending to topic:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  sendPushNotification,
  sendToTopic,
};
