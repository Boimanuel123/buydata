import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockPrisma, isMockingDatabase } from "@/lib/mock-db";

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, uid } = await request.json();

    if (!email || !uid) {
      return NextResponse.json(
        { error: "Email and UID are required" },
        { status: 400 }
      );
    }

    // Use real or mock database
    const db = isMockingDatabase() ? mockPrisma : prisma;
    console.log(`[firebase-sync] Using ${isMockingDatabase() ? "MOCK" : "REAL"} database for email: ${email}`);

    // Check if agent exists
    let agent = await db.agent.findUnique({
      where: { email },
    });

    console.log(`[firebase-sync] Agent lookup result:`, agent);

    if (!agent) {
      // Create new agent if doesn't exist
      // Generate slug from display name or email
      const baseSlug = (displayName || email.split("@")[0])
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const timestamp = Date.now().toString().slice(-5);
      const slug = `${baseSlug}-${timestamp}`;

      console.log(`[firebase-sync] Creating new agent with slug: ${slug}`);

      agent = await db.agent.create({
        data: {
          email,
          businessName: displayName || email,
          slug,
          firebaseUid: uid,
          status: "PENDING",
          commissionRate: 0.3,
          phoneNumber: "",
          bankName: "",
          accountNumber: "",
          accountName: "",
        },
      });

      console.log(`[firebase-sync] Agent created:`, agent);

      return NextResponse.json(
        {
          agent,
          message: "Agent created successfully. Please complete activation.",
        },
        { status: 201 }
      );
    }

    // Update existing agent with Firebase UID if not already set
    if (!agent.firebaseUid) {
      agent = await db.agent.update({
        where: { id: agent.id },
        data: { firebaseUid: uid },
      });
    }

    return NextResponse.json(
      {
        agent,
        message: "Agent found and synced",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Firebase sync error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to sync with database" },
      { status: 500 }
    );
  }
}
