import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";
import * as admin from "firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { firebaseUid, packageId, recipientPhone, agentSlug } = await request.json();

    if (!firebaseUid || !packageId || !recipientPhone || !agentSlug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("[ORDER INIT] Processing order for package:", packageId);
    console.log("[ORDER INIT] Recipient phone:", recipientPhone);

    // Fetch agent by slug to get agent ID
    const agentSnapshot = await db
      .collection(COLLECTIONS.AGENTS)
      .where("slug", "==", agentSlug)
      .limit(1)
      .get();

    if (agentSnapshot.empty) {
      console.error("[ORDER INIT] Agent not found for slug:", agentSlug);
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    const agentDoc = agentSnapshot.docs[0];
    const agentData = agentDoc.data();
    const agentId = agentDoc.id;

    // Fetch package details
    const packageDoc = await db
      .collection(COLLECTIONS.PACKAGES)
      .doc(packageId)
      .get();

    let packageData: any;
    if (packageDoc.exists) {
      packageData = packageDoc.data();
    } else {
      // Use default packages if not in DB
      const defaultPackages: any = {
        "pkg-1gb": {
          name: "1GB Data",
          network: "MTN",
          capacity: "1",
          basePrice: 4.5,
        },
        "pkg-2gb": {
          name: "2GB Data",
          network: "MTN",
          capacity: "2",
          basePrice: 7.5,
        },
        "pkg-5gb": {
          name: "5GB Data",
          network: "MTN",
          capacity: "5",
          basePrice: 15,
        },
        "pkg-10gb": {
          name: "10GB Data",
          network: "MTN",
          capacity: "10",
          basePrice: 25,
        },
      };
      packageData = defaultPackages[packageId];
    }

    if (!packageData) {
      console.error("[ORDER INIT] Package not found:", packageId);
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    // Get agent's custom price for this package (if set)
    const agentPrice =
      agentData.agentPrices && agentData.agentPrices[packageId]
        ? agentData.agentPrices[packageId]
        : packageData.basePrice;

    // Create order document
    const orderData = {
      agentId: agentId,
      firebaseUid: firebaseUid,
      packageId: packageId,
      packageName: packageData.name,
      network: packageData.network,
      capacity: packageData.capacity,
      recipientPhone: recipientPhone,
      amount: Math.round(agentPrice * 100), // Convert to pesewas
      basePrice: packageData.basePrice,
      agentPrice: agentPrice,
      status: "PENDING",
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    // Save order to Firestore
    const orderRef = await db.collection(COLLECTIONS.ORDERS).add(orderData);
    console.log("[ORDER INIT] Order created:", orderRef.id);

    // Initialize Paystack payment
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          email: agentData.email,
          amount: Math.round(agentPrice * 100), // in pesewas
          metadata: {
            firebaseUid: firebaseUid,
            agentId: agentId,
            agentSlug: agentSlug,
            orderId: orderRef.id,
            packageId: packageId,
            recipientPhone: recipientPhone,
            packageName: packageData.name,
            purpose: "data_purchase",
          },
          callback_url: `${baseUrl}/${agentSlug}?payment=true&order=${orderRef.id}`,
        }),
      }
    );

    const paymentData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error("[ORDER INIT] Paystack error:", paymentData);
      // Delete order if payment init failed
      await db.collection(COLLECTIONS.ORDERS).doc(orderRef.id).delete();
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 400 }
      );
    }

    console.log("[ORDER INIT] Paystack payment initialized");

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      authorizationUrl: paymentData.data.authorization_url,
      accessCode: paymentData.data.access_code,
      reference: paymentData.data.reference,
    });
  } catch (error) {
    console.error("[ORDER INIT ERROR]", error);
    return NextResponse.json(
      {
        error: "Failed to initialize payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
