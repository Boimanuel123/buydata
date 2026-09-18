import * as admin from "firebase-admin";

function getFirestore() {
  if (admin.apps.length) {
    return admin.firestore();
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey || projectId === "your_firebase_project_id") {
    throw new Error("Firebase Admin credentials are not configured");
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    projectId,
  });

  return admin.firestore();
}

// Defer credential validation until an API route actually uses Firestore.
export const db = new Proxy({} as admin.firestore.Firestore, {
  get(_target, property) {
    const value = Reflect.get(getFirestore(), property);
    return typeof value === "function" ? value.bind(getFirestore()) : value;
  },
});

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

