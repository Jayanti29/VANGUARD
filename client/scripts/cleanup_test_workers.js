import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAvc3PL7uetoEB7ztJUnvi_x04bfYz24fs",
  authDomain: "device-streaming-6d53114f.firebaseapp.com",
  projectId: "device-streaming-6d53114f",
  storageBucket: "device-streaming-6d53114f.firebasestorage.app",
  messagingSenderId: "1089352784972",
  appId: "1:1089352784972:web:315d49b5e985c02a46a8e9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const idsToDelete = [
  'local_google_1782668930811',
  'vanguard_guest_1782724800865',
];

async function cleanup() {
  try {
    for (const id of idsToDelete) {
      await deleteDoc(doc(db, 'workers', id));
      console.log('Deleted worker ID:', id);
    }
    console.log('Cleanup script finished successfully!');
  } catch (error) {
    console.error('Error deleting document:', error);
  }
}

cleanup();
