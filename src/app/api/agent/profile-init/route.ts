import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";
import * as admin from "firebase-admin";

export async function POST(request: NextRequest) {
  try {
    console.log("[PROFILE-INIT] Starting...");

    // Get Firebase UID from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("[PROFILE-INIT] Missing or invalid authorization header");
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const firebaseUid = authHeader.substring(7);
    console.log("[PROFILE-INIT] Processing for UID:", firebaseUid);

    // Check if agent profile exists
    const agentsSnapshot = await db
      .collection(COLLECTIONS.AGENTS)
      .where("firebaseUid", "==", firebaseUid)
      .limit(1)
      .get();

    if (!agentsSnapshot.empty) {
      // Profile already exists
      console.log("[PROFILE-INIT] Profile already exists");
      const doc = agentsSnapshot.docs[0];
      const data = doc.data();
      return NextResponse.json({
        success: true,
        message: "Profile already exists",
        agent: {
          id: doc.id,
          ...data,
        },
      });
    }

    // Profile doesn't exist - create a minimal one
    // The client should provide basic info, but we'll create with minimal data
    console.log("[PROFILE-INIT] Creating minimal profile...");

    const emailPrefix = `agent`;
    const slug = `${emailPrefix}-${firebaseUid.substring(0, 8)}`;

    // Create minimal agent profile
    const newAgent = {
      firebaseUid,
      email: "", // Will be set by client
      name: "Agent", // Will be set by client
      businessName: "My Business", // Will be set by client
      phone: "",
      description: "",
      slug,
      status: "PENDING",
      commissionRate: 0.05,
      totalEarned: 0,
      balance: 0,
      totalWithdrawn: 0,
      totalOrders: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    // Save to Firestore
    console.log("[PROFILE-INIT] Saving agent profile to Firestore...");
    await db.collection(COLLECTIONS.AGENTS).doc(firebaseUid).set(newAgent);

    console.log("[PROFILE-INIT] Profile created successfully");

    return NextResponse.json({
      success: true,
      message: "Profile created successfully",
      agent: {
        id: firebaseUid,
        ...newAgent,
      },
    });
  } catch (error) {
    console.error("[PROFILE-INIT ERROR]", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to create profile: ${errorMsg}` },
      { status: 500 }
    );
  }
}
