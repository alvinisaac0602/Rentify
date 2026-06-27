import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc } from 'firebase/firestore';
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
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  const email = `landlord_isaac_${Date.now()}@gmail.com`;
  const password = 'password123';
  
  console.log("Creating new landlord auth user:", email);
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;
  console.log("Created user with UID:", uid);

  // Write the user profile with complete details
  console.log("Saving user profile to Firestore...");
  await setDoc(doc(db, 'users', uid), {
    displayName: 'Alvin Isaac',
    email: email,
    phoneNumber: '+256 789 186476',
    isLandlord: true,
    avatarUrl: 'https://firebasestorage.googleapis.com/v0/b/rentify-e86d3.firebasestorage.app/o/avatars%2FHoAIHQgCE2PLIw70m0i3GcjLNOd2%2Fprofile.jpeg?alt=media&token=d0fabb7b-cca4-4dd0-9684-5bc3ec56943b',
    isVerified: true,
    trustScore: 95,
    blockedUsers: [],
    createdAt: new Date().toISOString()
  });

  // Update properties to refer to the new landlord
  console.log("Updating properties to link to the new landlord...");
  await updateDoc(doc(db, 'properties', 'rtyuPyYAtd0kGudCgqM1'), {
    landlordId: uid
  });
  await updateDoc(doc(db, 'properties', 'zdlCJXIEuh61evlgJloA'), {
    landlordId: uid
  });

  console.log("All properties updated successfully!");
}

run().catch(console.error);
