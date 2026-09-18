import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";
import { generateAgentSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log(`[LOGIN API] Attempting login for: ${email}`);

    // Use Firebase REST API to authenticate
    const firebaseApiUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;

    const response = await fetch(firebaseApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[LOGIN API] Firebase error:`, data);
      return NextResponse.json(
        { error: data.error?.message || "Login failed" },
        { status: 401 }
      );
    }

    const firebaseUid = data.localId;
    console.log(`[LOGIN API] Login successful for: ${email}, UID: ${firebaseUid}`);

    // Check if agent exists in Firestore
    const agentsSnapshot = await db
      .collection(COLLECTIONS.AGENTS)
      .where("firebaseUid", "==", firebaseUid)
      .limit(1)
      .get();

    let agent = null;
    if (!agentsSnapshot.empty) {
      agent = agentsSnapshot.docs[0].data();
      console.log(`[LOGIN API] Agent found in Firestore: ${agentsSnapshot.docs[0].id}`);
    } else {
      console.log(`[LOGIN API] Agent not found, creating new agent for ${email}`);
      
      // Create new agent in Firestore
      const slug = generateAgentSlug(email.split("@")[0]);
      const agentData = {
        email,
        name: email.split("@")[0],
        businessName: "My Business",
        slug,
        firebaseUid,
        status: "PENDING",
        commissionRate: 0.3,
        phone: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await db.collection(COLLECTIONS.AGENTS).add(agentData);
      console.log(`[LOGIN API] Agent created in Firestore: ${docRef.id}`);
      agent = agentData;
    }

    // Return user info and ID token
    return NextResponse.json({
      success: true,
      user: {
        uid: firebaseUid,
        email: data.email,
        idToken: data.idToken,
      },
    });
  } catch (error: any) {
    console.error("[LOGIN API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
