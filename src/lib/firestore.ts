import * as admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      // Uses GOOGLE_APPLICATION_CREDENTIALS environment variable or default credentials
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export const db = admin.firestore();

// Firestore collection names
export const COLLECTIONS = {
  AGENTS: "agents",
  PACKAGES: "packages",
  ORDERS: "orders",
  TRANSACTIONS: "transactions",
};

// Agent document type
export interface AgentDoc {
  firebaseUid: string;
  email: string;
  name: string;
  businessName?: string;
  phone?: string;
  description?: string;
  slug: string;
  status: "PENDING" | "ACTIVATED" | "SUSPENDED" | "DELETED";
  commissionRate: number;
  totalEarned?: number;
  balance?: number;
  totalWithdrawn?: number;
  totalOrders?: number;
  agentPrices?: Record<string, number>; // { packageId: customPrice }
  activatedAt?: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

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

// Order document type
export interface OrderDoc {
  agentId: string;
  packageId: string;
  recipientPhone: string;
  amount: number;
  commission: number;
  status: "PENDING" | "PAID" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  paystackReference?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

// Transaction document type
export interface TransactionDoc {
  agentId: string;
  type: "ACTIVATION" | "ORDER";
  amount: number;
  paystackReference: string;
  status: "PENDING" | "INITIALIZED" | "COMPLETED" | "FAILED" | "CANCELLED";
  metadata: Record<string, any>;
  createdAt: admin.firestore.Timestamp;
}
