import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db, COLLECTIONS } from "@/lib/firestore";
import { generateReference, convertToKobo } from "@/lib/utils";
import * as admin from "firebase-admin";

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product,
      agentSlug,
      email,
      phone,
      network,
    } = body;

    if (!product || !agentSlug || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("[CHECKOUT] Processing order for agent:", agentSlug);
    console.log("[CHECKOUT] Product:", product);

    // Find agent by slug in Firestore
    const agentQuery = await db
      .collection(COLLECTIONS.AGENTS)
      .where("slug", "==", agentSlug)
      .limit(1)
      .get();

    if (agentQuery.empty) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    const agentDoc = agentQuery.docs[0];
    const agent = agentDoc.data();

    if (agent.status !== "ACTIVATED") {
      return NextResponse.json(
        { error: "Agent not activated" },
        { status: 403 }
      );
    }

    // Get the price agent set, or use base price if not set
    const agentPrices = agent.agentPrices || {};
    const agentPrice = agentPrices[product.id] || product.basePrice || product.price;
    
    // Calculate commission: agent price - base price
    const basePrice = product.basePrice || product.price;
    const commission = Math.max(0, agentPrice - basePrice);

    console.log("[CHECKOUT] Base price:", basePrice);
    console.log("[CHECKOUT] Agent price:", agentPrice);
    console.log("[CHECKOUT] Commission:", commission);

    // Create order in Firestore
    const orderRef = await db.collection(COLLECTIONS.ORDERS).add({
      agentId: agentDoc.id,
      agentSlug: agentSlug,
      customerEmail: email || "unknown@example.com",
      customerPhone: phone,
      productId: product.id,
      productName: product.name,
      network: network || product.network || "",
      capacity: product.capacity || "",
      basePrice: basePrice,
      agentPrice: agentPrice,
      commission: commission,
      status: "PENDING",
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    const amountKobo = convertToKobo(agentPrice); // Charge agent price to customer
    const reference = generateReference("order");

    console.log(`[CHECKOUT] Order created: orderId: ${orderRef.id}, Reference: ${reference}`);

    // Dev mode: return mock response
    if (DEV_MODE) {
      return NextResponse.json({
        success: true,
        authorization_url: `/order-success?reference=${reference}&status=completed&agentSlug=${agentSlug}`,
        access_code: "mock_access_code",
        reference,
        _dev_mode: true,
      });
    }

    // Production: initialize with Paystack
    try {
      const paystackResponse = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: email || phone,
          amount: amountKobo,
          reference,
          metadata: {
            orderId: orderRef.id,
            agentId: agentDoc.id,
            agentSlug,
            customerPhone: phone,
            productName: product.name,
            network: network || product.network,
            type: "ORDER",
          },
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/orders/verify`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      if (paystackResponse.data.status) {
        return NextResponse.json({
          success: true,
          authorization_url: paystackResponse.data.data.authorization_url,
          access_code: paystackResponse.data.data.access_code,
          reference,
        });
      }
    } catch (error) {
      console.error("[PAYSTACK ERROR]", error);
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[ORDER CHECKOUT ERROR]", error);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
