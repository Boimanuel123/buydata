import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { db, COLLECTIONS } from "@/lib/firestore";

function serialize(value: any) { return value?.toDate ? value.toDate().toISOString() : value; }

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snapshot = await db.collection(COLLECTIONS.SUPPORT_MESSAGES).limit(500).get();
  const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => String(a.createdAt).localeCompare(String(b.createdAt))).map((message: any) => ({ ...message, createdAt: serialize(message.createdAt) }));
  return NextResponse.json({ messages });
}
