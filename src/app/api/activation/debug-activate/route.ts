import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS, AgentDoc } from "@/lib/firestore";
import * as admin from "firebase-admin";

/**
 * DEBUG ENDPOINT: Simulates the complete Paystack activation flow
 * Can be used for testing without needing ngrok/Paystack setup
 * Usage: POST /api/activation/debug-activate
 * Body: { firebaseUid: "xxx", email: "test@example.com", name: "Test Agent" }
 */
export async function POST(request: NextRequest) {
  try {
    const { firebaseUid, email, name, businessName, phone } = await request.json();

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { error: "Missing firebaseUid or email" },
        { status: 400 }
      );
    }

    console.log("[DEBUG] Starting activation flow for UID:", firebaseUid);

    // Step 1: Find or create agent
    let agent: (AgentDoc & { id: string }) | null = null;
    
    const agentQuery = await db
      .collection(COLLECTIONS.AGENTS)
      .where("firebaseUid", "==", firebaseUid)
      .limit(1)
      .get();

    if (!agentQuery.empty) {
      const doc = agentQuery.docs[0];
      agent = { id: doc.id, ...doc.data() } as AgentDoc & { id: string };
      console.log("[DEBUG] Found existing agent:", agent.id);
    } else {
      console.log("[DEBUG] Creating new agent...");
      
      const slugBase = (businessName || name || "agent")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const slug = `${slugBase}-${randomSuffix}`;

      const newAgent: AgentDoc = {
        firebaseUid,
        email,
        name: name || "Agent",
        businessName: businessName || "",
        phone: phone || "",
        slug,
        status: "PENDING",
        commissionRate: 0.1,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      const docRef = await db.collection(COLLECTIONS.AGENTS).add(newAgent);
      agent = { id: docRef.id, ...newAgent };
      console.log("[DEBUG] Created new agent:", agent.id);
    }

    // Step 2: Activate the agent (simulate payment verification)
    console.log("[DEBUG] Activating agent:", agent.id);
    
    const now = admin.firestore.Timestamp.now();
    const updatePayload: any = {
      status: "ACTIVATED",
      activatedAt: now,
      updatedAt: now,
    };

    // Regenerate slug from businessName if provided
    if (businessName && businessName !== "My Business") {
      const slugBase = businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      updatePayload.slug = `${slugBase}-${randomSuffix}`;
      console.log("[DEBUG] New slug:", updatePayload.slug);
    }

    await db.collection(COLLECTIONS.AGENTS).doc(agent.id).update(updatePayload);
    console.log("[DEBUG] Agent activated successfully");

    const activatedAgent = { ...agent, ...updatePayload };

    return NextResponse.json({
      success: true,
      message: "Agent activated successfully (DEBUG MODE)",
      agent: {
        id: agent.id,
        email: agent.email,
        name: agent.name,
        status: "ACTIVATED",
        slug: activatedAgent.slug || agent.slug,
        shop_url: `http://localhost:3000/${activatedAgent.slug || agent.slug}`,
      },
    });
  } catch (error) {
    console.error("[DEBUG ERROR]", error);
    return NextResponse.json(
      {
        error: "Debug activation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to list all agents in the database
 * Useful for debugging
 */
export async function GET(request: NextRequest) {
  try {
    console.log("[DEBUG] Listing all agents...");
    const startTime = Date.now();
    
    console.log("[DEBUG] Starting Firestore query...");
    const snapshot = await db.collection(COLLECTIONS.AGENTS).limit(5).get();
    
    const queryTime = Date.now() - startTime;
    console.log(`[DEBUG] Firestore query completed in ${queryTime}ms`);
    
    const agents = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        businessName: data.businessName,
        status: data.status,
        slug: data.slug,
        firebaseUid: data.firebaseUid,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      };
    });

    console.log(`[DEBUG] Query returned ${agents.length} agents in ${queryTime}ms`);

    return NextResponse.json({
      success: true,
      count: agents.length,
      queryTime: `${queryTime}ms`,
      agents,
    });
  } catch (error) {
    console.error("[DEBUG ERROR]", error);
    return NextResponse.json(
      {
        error: "Failed to list agents",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
