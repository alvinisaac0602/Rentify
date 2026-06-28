import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
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
  const docRef = doc(db, 'properties', 'EXicIIWzno0RSLhzvDG7');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    console.log("EXicIIWzno0RSLhzvDG7 detail:", {
      title: data.title,
      isVerified: data.isVerified,
      isVerifiedType: typeof data.isVerified,
      landlordId: data.landlordId,
      verificationStatus: data.verificationStatus
    });
  } else {
    console.log("Not found");
  }
}

run().catch(console.error);
