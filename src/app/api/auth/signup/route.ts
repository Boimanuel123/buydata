import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";
import { generateAgentSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword, phone, businessName } = body;

    // Validation
    if (!email || !password || !name || !phone || !businessName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    console.log(`[SIGNUP API] Creating account for: ${email}`);

    // Create Firebase user
    const firebaseApiUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;

    const firebaseResponse = await fetch(firebaseApiUrl, {
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

    const firebaseData = await firebaseResponse.json();

    if (!firebaseResponse.ok) {
      console.error(`[SIGNUP API] Firebase error:`, firebaseData);
      return NextResponse.json(
        { error: firebaseData.error?.message || "Signup failed" },
        { status: 400 }
      );
    }

    const firebaseUid = firebaseData.localId;
    console.log(`[SIGNUP API] Firebase user created with UID: ${firebaseUid}`);

    // Create agent record in Firestore
    const slug = generateAgentSlug(name);
    const agentData = {
      email,
      name,
      businessName,
      slug,
      firebaseUid,
      status: "PENDING",
      commissionRate: 0.3,
      phone,
      bankName: "",
      accountNumber: "",
      accountName: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection(COLLECTIONS.AGENTS).add(agentData);
    console.log(`[SIGNUP API] Agent created in Firestore: ${docRef.id}`);

    return NextResponse.json({
      success: true,
      user: {
        uid: firebaseUid,
        email,
        idToken: firebaseData.idToken,
      },
      agent: agentData,
    });
  } catch (error: any) {
    console.error("[SIGNUP API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Signup failed" },
      { status: 500 }
    );
  }
}
