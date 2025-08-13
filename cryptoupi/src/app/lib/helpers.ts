import {doc, setDoc, getDoc, updateDoc, 
  serverTimestamp, DocumentData } from "firebase/firestore";
import crypto from "crypto";
import { db } from "./firebase"; // Adjust the import path as necessary


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