import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { firebaseApp } from "./firebase";

const db = getFirestore(firebaseApp);

// User/Agent types
export interface FirebaseAgent {
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
  agentPrices?: Record<string, number>;
  activatedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Order {
  id?: string;
  agentId: string;
  packageId: string;
  recipientPhone: string;
  amount: number;
  commission: number;
  status: "PENDING" | "PAID" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  paystackReference?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Generate unique slug from business name
function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ============ AGENT OPERATIONS ============

/**
 * Create a new agent in Firestore
 */
export async function createAgentProfile(
  firebaseUid: string,
  agentData: Omit<FirebaseAgent, "firebaseUid" | "createdAt" | "updatedAt">
): Promise<FirebaseAgent> {
  const slug = generateSlug(agentData.businessName || agentData.name);
  
  const newAgent: FirebaseAgent = {
    ...agentData,
    firebaseUid,
    slug,
    status: "PENDING",
    commissionRate: 5,
    totalEarned: 0,
    balance: 0,
    totalWithdrawn: 0,
    totalOrders: 0,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  try {
    await setDoc(doc(db, "agents", firebaseUid), newAgent);
    return newAgent;
  } catch (error) {
    console.error("Error creating agent profile:", error);
    throw error;
  }
}

/**
 * Get agent profile by Firebase UID
 */
export async function getAgentProfile(
  firebaseUid: string
): Promise<FirebaseAgent | null> {
  try {
    console.log("[FIRESTORE CLIENT] Getting agent profile for UID:", firebaseUid);
    const docRef = doc(db, "agents", firebaseUid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("[FIRESTORE CLIENT] Agent profile found");
      return docSnap.data() as FirebaseAgent;
    }
    console.log("[FIRESTORE CLIENT] Agent profile not found");
    return null;
  } catch (error) {
    console.error("[FIRESTORE CLIENT] Error getting agent profile:", error);
    throw error;
  }
}

/**
 * Update agent profile
 */
export async function updateAgentProfile(
  firebaseUid: string,
  updates: Partial<FirebaseAgent>
): Promise<void> {
  try {
    const docRef = doc(db, "agents", firebaseUid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating agent profile:", error);
    throw error;
  }
}

/**
 * Get agent by email
 */
export async function getAgentByEmail(email: string): Promise<FirebaseAgent | null> {
  try {
    const q = query(collection(db, "agents"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as FirebaseAgent;
    }
    return null;
  } catch (error) {
    console.error("Error getting agent by email:", error);
    throw error;
  }
}

// ============ ORDER OPERATIONS ============

/**
 * Create a new order
 */
export async function createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const newOrder: Order = {
      ...orderData,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, newOrder);
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

/**
 * Get orders for an agent
 */
export async function getAgentOrders(agentId: string): Promise<Order[]> {
  try {
    const q = query(collection(db, "orders"), where("agentId", "==", agentId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
}

/**
 * Get single order
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const docRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Order;
    }
    return null;
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  updates?: Partial<Order>
): Promise<void> {
  try {
    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, {
      status,
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

// ============ ACTIVITY/LOGGING ============

/**
 * Log an activity/event
 */
export async function logActivity(
  firebaseUid: string,
  activityType: string,
  data: Record<string, any>
): Promise<void> {
  try {
    const activitiesRef = collection(db, "agents", firebaseUid, "activities");
    await addDoc(activitiesRef, {
      type: activityType,
      ...data,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error;
  }
}

/**
 * Get agent activities
 */
export async function getAgentActivities(
  firebaseUid: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const q = query(
      collection(db, "agents", firebaseUid, "activities"),
      // orderBy is handled by Firestore rules
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting activities:", error);
    throw error;
  }
}


