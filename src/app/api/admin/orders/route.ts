import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { db, COLLECTIONS } from "@/lib/firestore";

function serialize(value: any) {
  if (value?.toDate) return value.toDate().toISOString();
  return value;
}

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snapshot = await db.collection(COLLECTIONS.ORDERS).orderBy("createdAt", "desc").limit(200).get();
  const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).map((order: any) => ({
    ...order,
    createdAt: serialize(order.createdAt),
    updatedAt: serialize(order.updatedAt),
    paidAt: serialize(order.paidAt),
  }));
  return NextResponse.json({ orders });
}
