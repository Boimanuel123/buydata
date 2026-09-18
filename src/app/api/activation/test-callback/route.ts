import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";
import * as admin from "firebase-admin";

export async function GET(request: NextRequest) {
  try {
    console.log("[TEST] Starting test callback endpoint");

    // Test 1: Check if agents collection exists and has documents
    console.log("[TEST] Checking agents collection...");
    const agentsSnapshot = await db.collection(COLLECTIONS.AGENTS).limit(1).get();
    console.log("[TEST] Agents in collection:", agentsSnapshot.size);

    if (!agentsSnapshot.empty) {
      const firstAgent = agentsSnapshot.docs[0];
      console.log("[TEST] First agent:", {
        id: firstAgent.id,
        data: firstAgent.data()
      });
    }

    // Test 2: Try to create and update a test document
    console.log("[TEST] Testing write operation...");
    const testRef = db.collection(COLLECTIONS.AGENTS).doc("test-doc-123");
    
    await testRef.set({
      test: true,
      timestamp: admin.firestore.Timestamp.now(),
    });
    
    console.log("[TEST] Test document created");
    
    // Now update it
    await testRef.update({
      status: "ACTIVATED",
      updatedAt: admin.firestore.Timestamp.now(),
    });
    
    console.log("[TEST] Test document updated");

    // Clean up
    await testRef.delete();
    console.log("[TEST] Test document deleted");

    return NextResponse.json({
      success: true,
      message: "All Firestore operations successful",
      agentCount: agentsSnapshot.size,
    });
  } catch (error) {
    console.error("[TEST ERROR]", error);
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
}
