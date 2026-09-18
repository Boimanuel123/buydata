import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";
import * as admin from "firebase-admin";

async function sendToDataMart(order: any, reference: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_DATAMART_API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DATAMART_API_KEY}`,
    },
    body: JSON.stringify({ network: order.network, phoneNumber: order.customerPhone, amount: order.amount, reference }),
  });
  return { success: response.ok, data: await response.json().catch(() => null) };
}

function hasValidSignature(payload: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const expected = createHmac("sha512", secret).update(payload).digest("hex");
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

async function processPayment(reference: string) {
  const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const verifyData = await verifyResponse.json();
  if (!verifyResponse.ok || verifyData.data?.status !== "success") throw new Error("Payment verification failed");

  const orderId = verifyData.data.metadata?.orderId;
  if (!orderId) throw new Error("Payment has no order metadata");
  const orderRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) throw new Error("Order not found");
  const order = orderDoc.data()!;
  if (order.status === "COMPLETED") return { orderId, status: "COMPLETED" };

  if (verifyData.data.amount !== Math.round(Number(order.amount) * 100) || verifyData.data.currency !== "GHS") {
    throw new Error("Payment amount does not match order");
  }

  await orderRef.update({ status: "PROCESSING", paystackReference: reference, paidAt: admin.firestore.Timestamp.now(), updatedAt: admin.firestore.Timestamp.now() });
  try {
    const fulfillment = await sendToDataMart(order, reference);
    if (!fulfillment.success) throw new Error("Data fulfillment failed");
    await orderRef.update({ status: "COMPLETED", datamartOrderId: fulfillment.data?.reference || null, datamartStatus: fulfillment.data?.status || null, updatedAt: admin.firestore.Timestamp.now() });
    return { orderId, status: "COMPLETED" };
  } catch (error) {
    await orderRef.update({ status: "PAID", updatedAt: admin.firestore.Timestamp.now() });
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  if (!reference) return NextResponse.redirect(new URL("/?payment=failed", request.url));
  try {
    await processPayment(reference);
    return NextResponse.redirect(new URL(`/order-success?reference=${encodeURIComponent(reference)}&status=completed`, request.url));
  } catch (error) {
    console.error("[ORDER CALLBACK ERROR]", error);
    return NextResponse.redirect(new URL(`/order-success?reference=${encodeURIComponent(reference)}&status=processing`, request.url));
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!hasValidSignature(rawBody, request.headers.get("x-paystack-signature"))) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  try {
    const event = JSON.parse(rawBody);
    if (event.event !== "charge.success" || !event.data?.reference) return NextResponse.json({ received: true });
    return NextResponse.json({ received: true, ...(await processPayment(event.data.reference)) });
  } catch (error) {
    console.error("[ORDER WEBHOOK ERROR]", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}