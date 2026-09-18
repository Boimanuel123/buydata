import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db, COLLECTIONS } from "@/lib/firestore";
import { generateReference, convertToKobo } from "@/lib/utils";
import * as admin from "firebase-admin";
import { DEFAULT_PACKAGES } from "@/app/api/packages/route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product,
      email,
      phone,
      network,
    } = body;

    if (!product?.id || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let packageData: any;
    try {
      const packageDoc = await db.collection(COLLECTIONS.PACKAGES).doc(product.id).get();
      packageData = packageDoc.exists && packageDoc.data()?.isActive !== false
        ? { id: packageDoc.id, ...packageDoc.data() }
        : DEFAULT_PACKAGES.find((item) => item.id === product.id);
    } catch (error) {
      console.error("[CHECKOUT] Package lookup failed, using defaults", error);
      packageData = DEFAULT_PACKAGES.find((item) => item.id === product.id);
    }

    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const price = Number(packageData.basePrice);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Package price is invalid" }, { status: 500 });
    }

    // Create order in Firestore
    const orderRef = await db.collection(COLLECTIONS.ORDERS).add({
      customerEmail: email || "unknown@example.com",
      customerPhone: phone,
      productId: packageData.id,
      productName: packageData.name,
      network: network || packageData.network || "",
      capacity: packageData.capacity || "",
      amount: price,
      status: "PENDING",
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    const amountKobo = convertToKobo(price);
    const reference = generateReference("order");

    console.log(`[CHECKOUT] Order created: orderId: ${orderRef.id}, Reference: ${reference}`);

    try {
      const paystackResponse = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: email || phone,
          amount: amountKobo,
          reference,
          metadata: {
            orderId: orderRef.id,
            customerPhone: phone,
            productName: packageData.name,
            network: network || packageData.network,
            type: "ORDER",
          },
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000"}/api/orders/verify`,
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
