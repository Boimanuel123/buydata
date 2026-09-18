import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS, AgentDoc } from "@/lib/firestore";
import * as admin from "firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference" },
        { status: 400 }
      );
    }

    console.log("[ACTIVATION] Verifying payment reference:", reference);

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();
    console.log("[ACTIVATION] Paystack verification response:", JSON.stringify(verifyData, null, 2));
    console.log("[ACTIVATION] Paystack verification response status:", verifyData.data?.status);

    if (!verifyResponse.ok || !verifyData.data || verifyData.data.status !== "success") {
      console.error("Payment verification failed:", JSON.stringify(verifyData, null, 2));
      return NextResponse.json(
        { error: `Payment verification failed: ${verifyData.message || "Unknown error"}` },
        { status: 400 }
      );
    }

    const agentId = verifyData.data.metadata?.agentId;
    const firebaseUid = verifyData.data.metadata?.firebaseUid;
    
    console.log("[ACTIVATION] Agent ID from metadata:", agentId);
    console.log("[ACTIVATION] Firebase UID from metadata:", firebaseUid);
    console.log("[ACTIVATION] Full metadata:", verifyData.data.metadata);

    if (!agentId && !firebaseUid) {
      console.error("No agentId or firebaseUid in metadata");
      return NextResponse.json(
        { error: "Invalid payment metadata" },
        { status: 400 }
      );
    }

    // Find agent by ID (preferred) or firebaseUid (fallback)
    let agent: (AgentDoc & { id: string }) | null = null;
    
    // Try to find by agentId first
    if (agentId) {
      try {
        console.log("[ACTIVATION] Looking up by agentId:", agentId);
        const docSnap = await db
          .collection(COLLECTIONS.AGENTS)
          .doc(agentId)
          .get();
        
        if (docSnap.exists) {
          agent = { id: docSnap.id, ...docSnap.data() } as AgentDoc & { id: string };
          console.log("[ACTIVATION] Found agent by agentId:", agent.id);
        } else {
          console.log("[ACTIVATION] Document not found by agentId:", agentId);
        }
      } catch (err) {
        console.log("[ACTIVATION] AgentId lookup failed:", err);
      }
    }

    // Fallback to firebaseUid if not found
    if (!agent && firebaseUid) {
      try {
        console.log("[ACTIVATION] Looking up by firebaseUid:", firebaseUid);
        const agentQuery = await db
          .collection(COLLECTIONS.AGENTS)
          .where("firebaseUid", "==", firebaseUid)
          .limit(1)
          .get();
        
        if (!agentQuery.empty) {
          const doc = agentQuery.docs[0];
          agent = { id: doc.id, ...doc.data() } as AgentDoc & { id: string };
          console.log("[ACTIVATION] Found agent by firebaseUid:", agent.id);
        } else {
          console.log("[ACTIVATION] No agent found by firebaseUid:", firebaseUid);
        }
      } catch (err) {
        console.log("[ACTIVATION] FirebaseUid lookup failed:", err);
      }
    }

    console.log("[ACTIVATION] Found agent:", agent?.id);

    if (!agent) {
      console.error("Agent not found. AgentID:", agentId, "UID:", firebaseUid);
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Update agent status to ACTIVATED
    try {
      console.log("[ACTIVATION] Starting status update for agent:", agent.id);
      
      const now = admin.firestore.Timestamp.now();
      console.log("[ACTIVATION] Timestamp created:", now);
      
      const updatePayload: any = {
        status: "ACTIVATED",
        activatedAt: now,
        updatedAt: now,
      };

      console.log("[ACTIVATION] Update payload before slug logic:", JSON.stringify(updatePayload));

      // If agent has a businessName, regenerate slug from it (instead of agent-xxx)
      if (agent.businessName && agent.businessName !== "My Business") {
        console.log("[ACTIVATION] Regenerating slug from businessName:", agent.businessName);
        const slugBase = agent.businessName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        updatePayload.slug = `${slugBase}-${randomSuffix}`;
        console.log("[ACTIVATION] New slug generated:", updatePayload.slug);
      }

      console.log("[ACTIVATION] Final update payload:", JSON.stringify(updatePayload));
      console.log("[ACTIVATION] Updating document - collection:", COLLECTIONS.AGENTS, "doc:", agent.id);

      await db.collection(COLLECTIONS.AGENTS).doc(agent.id).update(updatePayload);

      console.log("[ACTIVATION] Agent activated successfully:", agent.id);

      // Return the updated slug if it was regenerated
      const activatedAgent = { ...agent, ...updatePayload };

      return NextResponse.json({
        success: true,
        message: "Account activated successfully",
        agent: {
          id: agent.id,
          status: "ACTIVATED",
          slug: activatedAgent.slug || agent.slug,
        },
      });
    } catch (err) {
      console.error("[ACTIVATION] Status update failed:", err);
      console.error("[ACTIVATION] Error details:", JSON.stringify(err, null, 2));
      throw err;
    }
  } catch (error) {
    console.error("[ACTIVATION ERROR]", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
