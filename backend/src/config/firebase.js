const admin = require('firebase-admin');
const path = require('path');

let firebaseApp = null;

const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;
  
  try {
    const serviceAccount = require('./firebase-admin-key.json');
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
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
  
  if (!tokens || tokens.length === 0) {
    console.log('No device tokens provided');
    return { success: 0, failure: 0 };
  }

  const tokensArray = Array.isArray(tokens) ? tokens : [tokens];
  
  const message = {
    notification: {
      title,
      body
    },
    data: {
      ...data,
      title,
      body
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        priority: 'high',
        channelId: 'onlyyou_notifications'
      }
    }
  };

  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokensArray,
      ...message
    });
    
    console.log(`Push notifications sent: ${response.successCount} success, ${response.failureCount} failure`);
    
    return {
      success: response.successCount,
      failure: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

const sendToTopic = async (topic, title, body, data = {}) => {
  if (!firebaseApp) {
    initializeFirebase();
  }

  const message = {
    topic,
    notification: {
      title,
      body
    },
    data: {
      ...data,
      title,
      body
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        priority: 'high',
        channelId: 'onlyyou_notifications'
      }
    }
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
  sendToTopic
};
