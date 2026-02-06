import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { mockPrisma, isMockingDatabase } from "@/lib/mock-db";
import { generateReference, convertToKobo } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ACTIVATION_FEE = 20; // GH20
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

function getDb() {
  return isMockingDatabase() ? mockPrisma : prisma;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = getDb();
    const agent = await db.agent.findUnique({
      where: { id: session.user.id },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    if (agent.status !== "PENDING") {
      return NextResponse.json(
        { error: "Agent is not pending activation" },
        { status: 400 }
      );
    }

    const amountKobo = convertToKobo(ACTIVATION_FEE);
    const reference = generateReference("activation");

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        agentId: agent.id,
        type: "ACTIVATION",
        reference,
        amount: ACTIVATION_FEE,
        amountKobo,
        status: "INITIALIZED",
      },
    });

    // Dev mode: return mock response
    if (DEV_MODE) {
      return NextResponse.json({
        success: true,
        authorization_url: `/activation-payment?reference=${reference}&dev=true`,
        access_code: "mock_access_code",
        reference,
        _dev_mode: true,
      });
    }

    // Production: initialize with Paystack
    try {
      const paystackResponse = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: agent.email,
          amount: amountKobo,
          reference,
          metadata: {
            agentId: agent.id,
            agentName: agent.name,
            type: "ACTIVATION",
          },
          callback_url: `${process.env.NEXTAUTH_URL}/api/activation/verify`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      if (paystackResponse.data.status) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            accessCode: paystackResponse.data.data.access_code,
            authorizationUrl: paystackResponse.data.data.authorization_url,
            paystackTransactionId: paystackResponse.data.data.reference,
          },
        });

        return NextResponse.json({
          success: true,
          authorization_url: paystackResponse.data.data.authorization_url,
          access_code: paystackResponse.data.data.access_code,
          reference,
        });
      }
    } catch (error) {
      console.error("[PAYSTACK ERROR]", error);
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[ACTIVATION ERROR]", error);
    return NextResponse.json(
      { error: "Activation payment failed" },
      { status: 500 }
    );
  }
}
