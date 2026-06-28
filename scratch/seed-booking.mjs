import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';

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
  const data = {
    userId: 'Cj9ELUUrO7dhq3uYAAtaCAL2sxp1',
    customerName: 'Kiiza Isaac',
    customerPhone: '0789186476',
    moverId: 'mv1',
    moverName: 'Swift Movers Uganda',
    priceEstimate: 'UGX 150,000',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, 'movingBookings'), data);
  console.log(`Seeded moving booking with ID: ${docRef.id}`);
}

run().catch(console.error);
