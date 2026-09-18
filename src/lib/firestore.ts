import * as admin from "firebase-admin";

// Initialize Firebase Admin with service account credentials
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    console.log("[FIREBASE ADMIN] Initializing with project:", serviceAccount.projectId);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    console.log("[FIREBASE ADMIN] Successfully initialized");
  } catch (error) {
    console.error("[FIREBASE ADMIN] Initialization error:", error);
    throw error;
  }
}

export const db = admin.firestore();

// Firestore collection names
export const COLLECTIONS = {
  PACKAGES: "packages",
  ORDERS: "orders",
};

// Package document type
export interface PackageDoc {
  name: string;
  network: string;
  capacity: string;
  basePrice: number;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: admin.firestore.Timestamp;
}

