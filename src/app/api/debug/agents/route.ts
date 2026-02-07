import { NextResponse } from "next/server";
import { db, COLLECTIONS } from "@/lib/firestore";

export async function GET() {
  try {
    const agentsSnapshot = await db
      .collection(COLLECTIONS.AGENTS)
      .limit(50)
      .get();

    const agents = agentsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        slug: data.slug,
        businessName: data.businessName || data.name,
        name: data.name,
        status: data.status,
        email: data.email,
      };
    });

    return NextResponse.json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    console.error("[DEBUG API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
