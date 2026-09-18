import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { db, COLLECTIONS } from "@/lib/firestore";
import { validatePackage } from "@/app/api/admin/packages/route";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const data = validatePackage(await request.json().catch(() => ({})));
  if (!data) return NextResponse.json({ error: "Provide a valid name, network, capacity, and positive price" }, { status: 400 });
  const ref = db.collection(COLLECTIONS.PACKAGES).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: "Package not found" }, { status: 404 });
  await ref.update(data);
  return NextResponse.json({ success: true, package: { id, ...data } });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const ref = db.collection(COLLECTIONS.PACKAGES).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: "Package not found" }, { status: 404 });
  await ref.delete();
  return NextResponse.json({ success: true });
}
