import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS, AgentDoc } from "@/lib/firestore";
import * as admin from "firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { firebaseUid, email, name, businessName, phone } = await request.json();

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("[ACTIVATION INIT] Processing for UID:", firebaseUid);
    console.log("[ACTIVATION INIT] Business Name:", businessName, "Phone:", phone);

    // Check if agent already exists by querying Firestore
    let agent: (AgentDoc & { id: string }) | null = null;
    
    const agentQuery = await db
      .collection(COLLECTIONS.AGENTS)
      .where("firebaseUid", "==", firebaseUid)
      .limit(1)
      .get();

    if (!agentQuery.empty) {
      const doc = agentQuery.docs[0];
      agent = { id: doc.id, ...doc.data() } as AgentDoc & { id: string };
      console.log("[ACTIVATION INIT] Agent exists:", agent.id);
    } else {
      console.log("[ACTIVATION INIT] Agent not found, creating new one...");
      
      // Generate unique slug using businessName if available
      const slugBase = (businessName || name || "agent").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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

      try {
        const docRef = await db.collection(COLLECTIONS.AGENTS).add(newAgent);
        agent = { id: docRef.id, ...newAgent };
        console.log("[ACTIVATION INIT] Created new agent:", agent.id);
        console.log("[ACTIVATION INIT] Agent data saved - businessName:", businessName, "phone:", phone);
      } catch (err) {
        console.error("[ACTIVATION INIT] Agent creation failed:", err);
        throw err;
      }
    }

    // Initialize Paystack payment
    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          email: email,
          amount: 2000, // GH₵20 in pesewas (1 GHS = 100 pesewas)
          metadata: {
            firebaseUid: firebaseUid,
            agentId: agent.id,
            agentName: name || "Agent",
            purpose: "account_activation",
          },
          callback_url: `${baseUrl}/activation-success`,
        }),
      }
    );

    const paymentData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error("Paystack error:", paymentData);
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 400 }
      );
    }

    console.log("[ACTIVATION INIT] Paystack payment initialized");

    return NextResponse.json({
      success: true,
      authorizationUrl: paymentData.data.authorization_url,
      accessCode: paymentData.data.access_code,
      reference: paymentData.data.reference,
    });
  } catch (error) {
    console.error("[ACTIVATION INIT ERROR]", error);
    return NextResponse.json(
      { 
        error: "Failed to initialize payment",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
