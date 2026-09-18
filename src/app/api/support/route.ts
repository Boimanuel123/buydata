import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { db, COLLECTIONS } from "@/lib/firestore";
import * as admin from "firebase-admin";

function serialize(value: any) {
  return value?.toDate ? value.toDate().toISOString() : value;
}

export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
  const snapshot = await db.collection(COLLECTIONS.SUPPORT_MESSAGES).where("conversationId", "==", conversationId).limit(200).get();
  const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => String(a.createdAt).localeCompare(String(b.createdAt))).map((message: any) => ({ ...message, createdAt: serialize(message.createdAt) }));
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const conversationId = String(body.conversationId || crypto.randomUUID());
  const message = String(body.message || "").trim();
  if (!message || message.length > 2000) return NextResponse.json({ error: "Enter a message up to 2,000 characters" }, { status: 400 });

  const adminReply = await isAdminRequest();
  if (adminReply && !body.sender) return NextResponse.json({ error: "Sender is required" }, { status: 400 });
  const sender = adminReply ? "admin" : "customer";
  const data = {
    conversationId,
    sender,
    message,
    customerName: String(body.customerName || "Guest").slice(0, 80),
    customerPhone: String(body.customerPhone || "").slice(0, 30),
    createdAt: admin.firestore.Timestamp.now(),
  };
  const messageRef = await db.collection(COLLECTIONS.SUPPORT_MESSAGES).add(data);
  return NextResponse.json({ success: true, conversationId, message: { id: messageRef.id, ...data, createdAt: new Date().toISOString() } });
}
