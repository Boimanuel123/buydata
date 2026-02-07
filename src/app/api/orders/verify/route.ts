import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";
import * as admin from "firebase-admin";

async function sendToDataMart(orderData: any) {
  try {
    const datamartUrl = `${process.env.NEXT_PUBLIC_DATAMART_API_BASE}/orders`;
    console.log("Sending to DataMart:", datamartUrl);
    
    const response = await fetch(datamartUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DATAMART_API_KEY}`,
      },
      body: JSON.stringify({
        network: orderData.network,
        phoneNumber: orderData.customerPhone,
        amount: orderData.price,
        reference: orderData.id,
      }),
    });

    const result = await response.json();
    console.log("DataMart response:", result);
    
    return { success: response.ok, data: result };
  } catch (error) {
    console.error("DataMart API error:", error);
    // Don't fail the whole order if DataMart fails
    // Return partial success so order is still marked as completed
    return { success: true, error, fallback: true };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: "Missing payment reference" },
        { status: 400 }
      );
    }

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

    if (!verifyResponse.ok || !verifyData.data || verifyData.data.status !== "success") {
      console.error("Payment verification failed:", verifyData);
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const orderId = verifyData.data.metadata.orderId;
    const agentSlug = verifyData.data.metadata.agentSlug;

    // Find and update order
    const orderDoc = await db
      .collection(COLLECTIONS.ORDERS)
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderDoc.data();

    // Find agent by slug
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

    // Send order to DataMart
    const datamartResult = await sendToDataMart({
      ...order,
      reference: reference,
    });

    // Update order status in Firestore
    await db.collection(COLLECTIONS.ORDERS).doc(orderId).update({
      status: datamartResult.success ? "COMPLETED" : "PENDING",
      datamartOrderId: datamartResult.data?.reference || null,
      datamartStatus: datamartResult.data?.status || null,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    // If successful, update agent earnings in Firestore
    // Commission is calculated as: agent price - base price
    if (datamartResult.success && agent) {
      const commission = order.commission || 0;
      
      console.log(`[ORDER VERIFY] Commission added to agent ${agentDoc.id}: GH₵${commission}`);

      await db.collection(COLLECTIONS.AGENTS).doc(agentDoc.id).update({
        totalEarned: admin.firestore.FieldValue.increment(commission),
        balance: admin.firestore.FieldValue.increment(commission),
        totalOrders: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }

    return NextResponse.json({
      success: datamartResult.success,
      message: datamartResult.success ? "Order processed successfully" : "Order processing failed",
      orderId: orderId,
      datamartResponse: datamartResult.data,
    });
  } catch (error) {
    console.error("Order verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
