// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, 
  serverTimestamp, DocumentData } from "firebase/firestore";
import crypto from "crypto";



// Firebase config — read from env variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// Prevent re-initializing Firebase on hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export interface User {
  phoneHash: string;
  walletAddress: string;
  displayName?: string | null;
  email?: string | null;
  createdAt: any;
  lastActive: any;
  is2FAEnabled: boolean;
  kycStatus: "pending" | "verified" | "rejected";
  profilePicURL?: string | null;
}

// --- Helper: Hash phone number ---
export const hashPhone = (phoneNumber: string): string => {
  return crypto.createHash("sha256").update(phoneNumber).digest("hex");
};

// --- Create new user ---
export const createUser = async ({
  phoneNumber,
  walletAddress,
  displayName,
  email,
}: {
  phoneNumber: string;
  walletAddress: string;
  displayName?: string;
  email?: string;
}): Promise<User> => {
  const phoneHash = hashPhone(phoneNumber);
  const userRef = doc(db, "Users", walletAddress);

  const userData: User = {
    phoneHash,
    walletAddress,
    displayName: displayName || null,
    email: email || null,
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
    is2FAEnabled: false,
    kycStatus: "pending",
    profilePicURL: null,
  };

  await setDoc(userRef, userData);
  return userData;
};

// --- Get user by walletAddress ---
export const getUser = async (walletAddress: string): Promise<User | null> => {
  const userRef = doc(db, "Users", walletAddress);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;
  return userSnap.data() as User;
};

// --- Update user ---
export const updateUser = async (
  walletAddress: string,
  updates: Partial<Omit<User, "walletAddress" | "phoneHash" | "createdAt">>
): Promise<void> => {
  const userRef = doc(db, "Users", walletAddress);
  updates.lastActive = serverTimestamp(); // auto-update last active
  await updateDoc(userRef, updates as DocumentData);
};

// --- Zero dev smart wallet creation ---

export const auth = getAuth(app);
export default app;