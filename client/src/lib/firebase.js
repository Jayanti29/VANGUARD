import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if keys are actually present. If not, we run in simulated/mock mode.
const hasFirebaseKeys = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key' && firebaseConfig.projectId;

let app;
let auth;
let db;
let storage;
let messaging;

// Mock Fallback implementation for testing without credentials
const createMockAuth = () => {
  let currentUser = JSON.parse(localStorage.getItem('vanguard_mock_user') || 'null');
  const listeners = [];
  
  const notifyListeners = () => {
    listeners.forEach(cb => cb(currentUser));
  };

  return {
    isMock: true,
    get currentUser() {
      return currentUser;
    },
    onAuthStateChanged: (callback) => {
      listeners.push(callback);
      // Immediately run with current state
      setTimeout(() => callback(currentUser), 50);
      return () => {
        const idx = listeners.indexOf(callback);
        if (idx > -1) listeners.splice(idx, 1);
      };
    },
    signInWithPhoneNumber: async (phone, verifier) => {
      console.log("[Mock Auth] signInWithPhoneNumber called for", phone);
      return {
        confirm: async (otp) => {
          if (otp === '123456' || otp) {
            currentUser = {
              uid: 'mock_uid_' + Math.random().toString(36).substr(2, 9),
              phoneNumber: phone,
              displayName: 'Mock Citizen',
              photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=mock_citizen',
            };
            localStorage.setItem('vanguard_mock_user', JSON.stringify(currentUser));
            notifyListeners();
            return { user: currentUser };
          }
          throw new Error("Invalid verification code. Use any code in mock mode.");
        }
      };
    },
    signInWithGoogle: async () => {
      currentUser = {
        uid: 'mock_uid_google_' + Math.random().toString(36).substr(2, 9),
        phoneNumber: '+919999999999',
        displayName: 'Mock User (Google)',
        email: 'user@example.com',
        photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=google_user',
      };
      localStorage.setItem('vanguard_mock_user', JSON.stringify(currentUser));
      notifyListeners();
      return { user: currentUser };
    },
    signOut: async () => {
      currentUser = null;
      localStorage.removeItem('vanguard_mock_user');
      notifyListeners();
    }
  };
};

const createMockDb = () => {
  const getStorageItem = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  const setStorageItem = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const listeners = {};

  const notifyRoute = (collectionPath) => {
    if (listeners[collectionPath]) {
      const data = getStorageItem(`vanguard_db_${collectionPath}`);
      listeners[collectionPath].forEach(cb => cb(data));
    }
  };

  return {
    isMock: true,
    collection: (name) => {
      return { name };
    },
    addDoc: async (coll, docData) => {
      console.log(`[Mock DB] Adding document to ${coll.name}:`, docData);
      const items = getStorageItem(`vanguard_db_${coll.name}`);
      const newDoc = { id: 'mock_doc_' + Math.random().toString(36).substr(2, 9), ...docData, createdAt: new Date().toISOString() };
      items.push(newDoc);
      setStorageItem(`vanguard_db_${coll.name}`, items);
      notifyRoute(coll.name);
      return newDoc;
    },
    setDoc: async (docRef, docData) => {
      console.log(`[Mock DB] Setting document in ${docRef.path}:`, docData);
      const parts = docRef.path.split('/');
      const collName = parts[0];
      const docId = parts[1];
      const items = getStorageItem(`vanguard_db_${collName}`);
      const index = items.findIndex(item => item.id === docId);
      const payload = { id: docId, ...docData };
      if (index > -1) {
        items[index] = payload;
      } else {
        items.push(payload);
      }
      setStorageItem(`vanguard_db_${collName}`, items);
      notifyRoute(collName);
    },
    getDoc: async (docRef) => {
      const parts = docRef.path.split('/');
      const collName = parts[0];
      const docId = parts[1];
      const items = getStorageItem(`vanguard_db_${collName}`);
      const found = items.find(item => item.id === docId);
      return {
        exists: () => !!found,
        data: () => found
      };
    },
    updateDoc: async (docRef, updateData) => {
      const parts = docRef.path.split('/');
      const collName = parts[0];
      const docId = parts[1];
      const items = getStorageItem(`vanguard_db_${collName}`);
      const index = items.findIndex(item => item.id === docId);
      if (index > -1) {
        items[index] = { ...items[index], ...updateData, updatedAt: new Date().toISOString() };
        setStorageItem(`vanguard_db_${collName}`, items);
        notifyRoute(collName);
      }
    },
    onSnapshotCollection: (collRef, callback) => {
      const collName = collRef.name;
      if (!listeners[collName]) listeners[collName] = [];
      listeners[collName].push(callback);

      // Initial call
      const data = getStorageItem(`vanguard_db_${collName}`);
      setTimeout(() => callback(data), 50);

      return () => {
        const idx = listeners[collName].indexOf(callback);
        if (idx > -1) listeners[collName].splice(idx, 1);
      };
    },
    onSnapshotDoc: (docRef, callback) => {
      const parts = docRef.path.split('/');
      const collName = parts[0];
      const docId = parts[1];
      
      const listenerWrapper = (dataList) => {
        const found = dataList.find(item => item.id === docId);
        callback({
          exists: () => !!found,
          data: () => found
        });
      };

      if (!listeners[collName]) listeners[collName] = [];
      listeners[collName].push(listenerWrapper);
      
      const items = getStorageItem(`vanguard_db_${collName}`);
      const found = items.find(item => item.id === docId);
      setTimeout(() => callback({
        exists: () => !!found,
        data: () => found
      }), 50);

      return () => {
        const idx = listeners[collName].indexOf(listenerWrapper);
        if (idx > -1) listeners[collName].splice(idx, 1);
      };
    }
  };
};

const createMockStorage = () => {
  return {
    isMock: true,
    ref: (path) => ({ path }),
    uploadBytes: async (refObj, bytes) => {
      console.log(`[Mock Storage] Uploaded ${bytes.size || bytes.byteLength || 'file'} to ${refObj.path}`);
      return { ref: refObj };
    },
    getDownloadURL: async (refObj) => {
      // Return a placeholder image or temporary URL depending on path
      if (refObj.path.includes('pdf')) {
        return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      }
      return 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80';
    }
  };
};

const createMockMessaging = () => {
  return {
    isMock: true,
    getToken: async () => 'mock_fcm_token_' + Math.random().toString(36).substr(2, 9),
    onMessage: (callback) => {
      console.log("[Mock Messaging] Registered listener");
      return () => {};
    }
  };
};

if (hasFirebaseKeys) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.warn("FCM messaging is not supported in this browser environment:", e);
      messaging = createMockMessaging();
    }
  } catch (err) {
    console.error("Firebase initialization failed, falling back to mock services:", err);
    app = { name: "MockVanguardApp" };
    auth = createMockAuth();
    db = createMockDb();
    storage = createMockStorage();
    messaging = createMockMessaging();
  }
} else {
  console.log("Firebase keys not set in env. Initializing Vanguard in mock mode.");
  app = { name: "MockVanguardApp" };
  auth = createMockAuth();
  db = createMockDb();
  storage = createMockStorage();
  messaging = createMockMessaging();
}

export { 
  app, 
  auth, 
  db, 
  storage, 
  messaging,
  hasFirebaseKeys,
  // Helper tools for sub-services in components
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  ref,
  uploadBytes,
  getDownloadURL,
  getToken,
  onMessage
};
