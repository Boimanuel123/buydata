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
    console.log("[ACTIVATION] Paystack verification response status:", verifyData.data?.status);

    if (!verifyResponse.ok || !verifyData.data || verifyData.data.status !== "success") {
      console.error("Payment verification failed:", verifyData);
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const agentId = verifyData.data.metadata.agentId;
    const firebaseUid = verifyData.data.metadata.firebaseUid;
    
    console.log("[ACTIVATION] Agent ID from metadata:", agentId);
    console.log("[ACTIVATION] Firebase UID from metadata:", firebaseUid);

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
        const docSnap = await db
          .collection(COLLECTIONS.AGENTS)
          .doc(agentId)
          .get();
        
        if (docSnap.exists) {
          agent = { id: docSnap.id, ...docSnap.data() } as AgentDoc & { id: string };
        }
      } catch (err) {
        console.log("[ACTIVATION] AgentId lookup failed:", err);
      }
    }

    // Fallback to firebaseUid if not found
    if (!agent && firebaseUid) {
      try {
        const agentQuery = await db
          .collection(COLLECTIONS.AGENTS)
          .where("firebaseUid", "==", firebaseUid)
          .limit(1)
          .get();
        
        if (!agentQuery.empty) {
          const doc = agentQuery.docs[0];
          agent = { id: doc.id, ...doc.data() } as AgentDoc & { id: string };
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
      const updatePayload: any = {
        status: "ACTIVATED",
        activatedAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      // If agent has a businessName, regenerate slug from it (instead of agent-xxx)
      if (agent.businessName && agent.businessName !== "My Business") {
        const slugBase = agent.businessName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        updatePayload.slug = `${slugBase}-${randomSuffix}`;
      }

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
