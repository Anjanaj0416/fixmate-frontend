// Firebase Configuration for Vite
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your Firebase configuration
// Vite uses import.meta.env instead of process.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fixamte-df879.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fixamte-df879",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fixamte-df879.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firebase Cloud Messaging
let messaging = null;
try {
  // Check if messaging is supported
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.log('Firebase Messaging not supported:', error);
}

export { messaging };

/**
 * Request permission for push notifications and get FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.log('Messaging not supported');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn('VAPID key not configured');
        return null;
      }

      const token = await getToken(messaging, { vapidKey });
      
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } else if (permission === 'denied') {
      console.log('Notification permission denied');
      return null;
    } else {
      console.log('Notification permission dismissed');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 * @param {Function} callback - Function to call when message is received
 */
export const onMessageListener = (callback) => {
  if (!messaging) {
    console.log('Messaging not supported');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    if (callback) {
      callback(payload);
    }
  });
};

export default app;