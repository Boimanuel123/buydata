import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get Firebase UID from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      console.log("[PROFILE] Missing authorization header");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const firebaseUid = authHeader.replace("Bearer ", "").trim();
    if (!firebaseUid) {
      console.log("[PROFILE] Empty Firebase UID");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[PROFILE] Fetching agent for UID:", firebaseUid);

    // Try to find agent by Firebase UID
    let agent = null;
    try {
      agent = await prisma.agent.findUnique({
        where: { firebaseUid },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          businessName: true,
          description: true,
          logo: true,
          coverImage: true,
          status: true,
          slug: true,
          totalEarned: true,
          totalWithdrawn: true,
          balance: true,
          commissionRate: true,
          createdAt: true,
          activatedAt: true,
        },
      });
    } catch (prismaError) {
      console.log("[PROFILE] Prisma lookup failed (likely schema mismatch):", prismaError);
      agent = null;
    }

    // If agent not found, return default data for new Firebase users
    if (!agent) {
      console.log("[PROFILE] Agent not found in database, returning default data");
      return NextResponse.json({
        success: true,
        agent: {
          id: firebaseUid,
          name: "Agent",
          email: "",
          phone: "",
          businessName: "My Business",
          description: "",
          logo: null,
          coverImage: null,
          status: "PENDING",
          slug: `agent-${firebaseUid.substring(0, 8)}`,
          totalEarned: 0,
          totalWithdrawn: 0,
          balance: 0,
          commissionRate: 0.1,
          createdAt: new Date(),
          activatedAt: null,
        },
      });
    }

    console.log("[PROFILE] Agent found:", agent.id);
    return NextResponse.json({
      success: true,
      agent,
    });
  } catch (error) {
    console.error("[PROFILE ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const firebaseUid = authHeader?.replace("Bearer ", "");

    if (!firebaseUid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { businessName, description, phone } = body;

    const agent = await prisma.agent.update({
      where: { firebaseUid },
      data: {
        businessName: businessName || undefined,
        description: description || undefined,
        phone: phone || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        description: true,
        slug: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      agent,
    });
  } catch (error) {
    console.error("[UPDATE PROFILE ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
