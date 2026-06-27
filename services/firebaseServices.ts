import { 
  collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion, 
  orderBy, limit, startAfter, QueryConstraint, getDoc, setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { FilterState } from '../components/ui/FilterChips';

export interface PropertyData {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  pricePeriod: string;
  location: string;
  category: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  isFurnished: boolean;
  images: string[];
  landlordId: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  trustScore: number;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  searchKeywords?: string[]; // Used for Firestore search querying
}

export interface ViewingRequestData {
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  landlordId: string;
  preferredTime: string;
  note?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

export interface ReportData {
  reporterId: string;
  targetType: 'property' | 'user';
  targetId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'application' | 'message' | 'price' | 'alert' | 'match';
  createdAt: string;
}

// Helper to generate search keywords from a string (e.g. "Modern Loft Kampala" -> ["modern", "loft", "kampala"])
export const generateSearchKeywords = (text: string): string[] => {
  const words = text.toLowerCase().split(/\s+/);
  const keywords = new Set<string>();

  words.forEach(word => {
    // Generate prefixes to allow partial search matching (e.g. "mod", "mode", "moder", "modern")
    for (let i = 1; i <= word.length; i++) {
      keywords.add(word.substring(0, i));
    }
  });

  return Array.from(keywords);
};

// 1. Fetch properties with filtering, search query, and pagination
export const fetchProperties = async (
  filters?: Partial<FilterState>,
  searchQuery?: string,
  lastDoc?: any,
  pageSize: number = 10
) => {
  const propertiesRef = collection(db, 'properties');
  const constraints: QueryConstraint[] = [];

  if (filters) {
    if (filters.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters.district) {
      constraints.push(where('location', '==', filters.district));
    }
    
    // Map priceRange thresholds correctly
    if (filters.priceRange && filters.priceRange !== 'all') {
      if (filters.priceRange === 'budget') {
        constraints.push(where('price', '<=', 700000));
      } else if (filters.priceRange === 'mid') {
        constraints.push(where('price', '>=', 700001));
        constraints.push(where('price', '<=', 3000000));
      } else if (filters.priceRange === 'premium') {
        constraints.push(where('price', '>=', 3000001));
      }
    }

    if (filters.verifiedOnly) {
      constraints.push(where('isVerified', '==', true));
    }
  }

  // If a search query is supplied, filter by keywords array
  if (searchQuery && searchQuery.trim() !== '') {
    const searchWord = searchQuery.toLowerCase().trim();
    constraints.push(where('searchKeywords', 'array-contains', searchWord));
  }

  // Always order by createdAt desc
  constraints.push(orderBy('createdAt', 'desc'));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  constraints.push(limit(pageSize));

  const q = query(propertiesRef, ...constraints);
  const snapshot = await getDocs(q);
  
  const properties = snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<PropertyData, 'id'>)
  }));

  return {
    properties,
    lastVisible: snapshot.docs[snapshot.docs.length - 1] || null
  };
};

// 2. Submit viewing request
export const submitViewingRequest = async (request: Omit<ViewingRequestData, 'status' | 'createdAt'>) => {
  const requestsRef = collection(db, 'viewingRequests');
  const docRef = await addDoc(requestsRef, {
    ...request,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

// 3. Report Listing
export const reportListing = async (report: Omit<ReportData, 'status' | 'createdAt'>) => {
  const reportsRef = collection(db, 'reports');
  const docRef = await addDoc(reportsRef, {
    ...report,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

// 4. Block landlord / user
export const blockUser = async (currentUserId: string, targetUserId: string) => {
  const userRef = doc(db, 'users', currentUserId);
  await setDoc(userRef, {
    blockedUsers: arrayUnion(targetUserId)
  }, { merge: true });
};

// 5. Save user push token for Firebase Cloud Messaging / Expo Push Notification services
export const saveUserPushToken = async (userId: string, token: string) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    pushToken: token
  }, { merge: true });
};

// 6. Fetch user notifications from Firestore in real-time
export const fetchUserNotifications = async (userId: string) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<NotificationData, 'id'>)
  }));
};

// 7. Submit identity verification documents to Firebase Storage & log status in Firestore
export const submitVerificationDocument = async (userId: string, documentUri: string, documentName: string) => {
  // Convert local document URI into blob format suitable for Firebase Storage upload using XMLHttpRequest
  const blob: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", documentUri, true);
    xhr.send(null);
  });

  // Create Reference & upload to Firebase Storage under verificationDocs/{userId}/{documentName}
  const storageRef = ref(storage, `verificationDocs/${userId}/${documentName}`);
  await uploadBytes(storageRef, blob);
  const downloadUrl = await getDownloadURL(storageRef);

  // Close the blob
  if (typeof (blob as any).close === 'function') {
    (blob as any).close();
  }

  // Update user doc in Firestore using setDoc with merge to ensure it succeeds even if user doc is missing
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    verificationDocUrl: downloadUrl,
    isVerified: false,
    verificationStatus: 'pending',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  return downloadUrl;
};

// 8. Upload profile avatar image to Firebase Storage & return download URL
export const uploadAvatarImage = async (userId: string, imageUri: string) => {
  const blob: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", imageUri, true);
    xhr.send(null);
  });

  const storageRef = ref(storage, `avatars/${userId}/profile.jpeg`);
  await uploadBytes(storageRef, blob);

  if (typeof (blob as any).close === 'function') {
    (blob as any).close();
  }

  return await getDownloadURL(storageRef);
};

// 9. Create a new property listing in Firestore
export const createProperty = async (property: Omit<PropertyData, 'id' | 'createdAt' | 'isVerified' | 'rating' | 'reviewCount' | 'trustScore'>) => {
  const propertiesRef = collection(db, 'properties');
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30); // Free listings expire after 30 days

  const docRef = await addDoc(propertiesRef, {
    ...property,
    isVerified: false,
    verificationStatus: 'unverified',
    rating: 0,
    reviewCount: 0,
    trustScore: 85,
    listingPlan: 'free',
    isPaid: false,
    featuredUntil: null,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    searchKeywords: generateSearchKeywords(property.title + " " + property.location),
  });
  return docRef.id;
};

// 10. Upload a property photo to Firebase Storage
export const uploadPropertyImage = async (propertyId: string, imageUri: string, index: number) => {
  const blob: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", imageUri, true);
    xhr.send(null);
  });

  const storageRef = ref(storage, `properties/${propertyId}/image_${index}.jpeg`);
  await uploadBytes(storageRef, blob);

  if (typeof (blob as any).close === 'function') {
    (blob as any).close();
  }

  return await getDownloadURL(storageRef);
};

// 11. Submit property verification documents to Firebase Storage & mark as verified in Firestore
export const submitPropertyVerificationDocument = async (propertyId: string, landlordId: string, documentUri: string, documentName: string) => {
  const blob: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", documentUri, true);
    xhr.send(null);
  });

  const storageRef = ref(storage, `propertyVerificationDocs/${propertyId}/${documentName}`);
  await uploadBytes(storageRef, blob);
  const downloadUrl = await getDownloadURL(storageRef);

  if (typeof (blob as any).close === 'function') {
    (blob as any).close();
  }

  // Update property doc in Firestore
  const propertyRef = doc(db, 'properties', propertyId);
  await updateDoc(propertyRef, {
    verificationDocUrl: downloadUrl,
    isVerified: true,
    verificationStatus: 'verified',
    updatedAt: new Date().toISOString()
  });

  return downloadUrl;
};

// 12. Request landlord account verification (instant self-service)
export const requestLandlordVerification = async (
  userId: string,
  fullName: string,
  idNumber: string,
  notes?: string
) => {
  const requestsRef = collection(db, 'verificationRequests');
  const requestDoc = await addDoc(requestsRef, {
    type: 'landlord',
    landlordId: userId,
    fullName,
    idNumber,
    notes: notes || '',
    status: 'approved',
    submittedAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
  });

  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: new Date().toISOString(),
    verificationRequestId: requestDoc.id,
  }, { merge: true });

  return requestDoc.id;
};

// 13. Request property verification (instant self-service)
export const requestPropertyVerification = async (
  propertyId: string,
  landlordId: string,
  propertyTitle: string,
  notes?: string
) => {
  const requestsRef = collection(db, 'verificationRequests');
  const requestDoc = await addDoc(requestsRef, {
    type: 'property',
    landlordId,
    propertyId,
    propertyTitle,
    notes: notes || '',
    status: 'approved',
    submittedAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
  });

  const propertyRef = doc(db, 'properties', propertyId);
  await updateDoc(propertyRef, {
    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: new Date().toISOString(),
    verificationRequestId: requestDoc.id,
  });

  return requestDoc.id;
};

// 14. Fetch all verification requests for a landlord
export const fetchVerificationRequests = async (landlordId: string) => {
  const q = query(
    collection(db, 'verificationRequests'),
    where('landlordId', '==', landlordId),
    orderBy('submittedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
};
