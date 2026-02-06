import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockPrisma, isMockingDatabase } from "@/lib/mock-db";
import { hashPassword, generateAgentSlug, isValidEmail } from "@/lib/utils";

function getDb() {
  return isMockingDatabase() ? mockPrisma : prisma;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      businessName,
    } = body;

    // Validation
    if (!email || !password || !name || !phone || !businessName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if agent already exists
    const db = getDb();
    const existingAgent = await db.agent.findUnique({
      where: { email },
    });

    if (existingAgent) {
      return NextResponse.json(
        { error: "Agent with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate unique slug
    const slug = generateAgentSlug(businessName);

    // Create agent
    const agent = await db.agent.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        businessName,
        slug,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Agent registered successfully",
        agent: {
          id: agent.id,
          email: agent.email,
          name: agent.name,
          slug: agent.slug,
          status: agent.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
