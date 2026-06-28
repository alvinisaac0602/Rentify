import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

// Read env file
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const collections = ['furnitureOrders', 'movingBookings', 'viewingRequests', 'properties', 'users'];
  for (const colName of collections) {
    console.log(`\n--- Collection: ${colName} ---`);
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`Count: ${snap.size}`);
      snap.forEach(docSnap => {
        console.log(`Doc ID: ${docSnap.id}`);
        console.log(JSON.stringify(docSnap.data(), null, 2));
      });
    } catch (e) {
      console.error(`Error fetching ${colName}:`, e.message);
    }
  }
}

run().catch(console.error);
