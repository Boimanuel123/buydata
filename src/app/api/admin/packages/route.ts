import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { db, COLLECTIONS } from "@/lib/firestore";
import { DEFAULT_PACKAGES } from "@/app/api/packages/route";
import * as admin from "firebase-admin";

const NETWORKS = ["MTN", "TELECEL", "AT"];

function validatePackage(body: any) {
  const name = String(body.name || "").trim();
  const network = String(body.network || "").trim().toUpperCase();
  const capacity = String(body.capacity || "").trim();
  const basePrice = Number(body.basePrice);
  if (!name || !NETWORKS.includes(network) || !capacity || !Number.isFinite(basePrice) || basePrice <= 0) return null;
  return {
    name,
    network,
    capacity,
    basePrice,
    description: String(body.description || `${capacity}GB data bundle`).trim(),
    image: network === "TELECEL" ? "/images/TELECEL.jpg" : network === "AT" ? "/images/AT.png" : "/images/MTN.jpg",
    isActive: body.isActive !== false,
    updatedAt: admin.firestore.Timestamp.now(),
  };
}

function serialize(value: any) {
  return value?.toDate ? value.toDate().toISOString() : value;
}

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snapshot = await db.collection(COLLECTIONS.PACKAGES).get();
  const packages = snapshot.empty
    ? DEFAULT_PACKAGES
    : snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ packages: packages.map((item: any) => ({ ...item, createdAt: serialize(item.createdAt), updatedAt: serialize(item.updatedAt) })) });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = validatePackage(await request.json().catch(() => ({})));
  if (!data) return NextResponse.json({ error: "Provide a valid name, network, capacity, and positive price" }, { status: 400 });
  const ref = await db.collection(COLLECTIONS.PACKAGES).add({ ...data, createdAt: admin.firestore.Timestamp.now() });
  return NextResponse.json({ success: true, package: { id: ref.id, ...data } }, { status: 201 });
}

export { validatePackage };
