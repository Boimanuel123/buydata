import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference" },
        { status: 400 }
      );
    }

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { reference },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Dev mode: skip real verification
    if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
      // Activate agent
      await prisma.agent.update({
        where: { id: transaction.agentId! },
        data: {
          status: "ACTIVATED",
          activatedAt: new Date(),
        },
      });

      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          verifiedAt: new Date(),
        },
      });

      return NextResponse.redirect(
        new URL(
          `/activation-success?reference=${reference}`,
          process.env.NEXTAUTH_URL
        )
      );
    }

    // Production: verify with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        timeout: 30000,
      }
    );

    if (
      paystackResponse.data.status &&
      paystackResponse.data.data.status === "success"
    ) {
      // Activate agent
      await prisma.agent.update({
        where: { id: transaction.agentId! },
        data: {
          status: "ACTIVATED",
          activatedAt: new Date(),
        },
      });

      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          verifiedAt: new Date(),
        },
      });

      return NextResponse.redirect(
        new URL(
          `/activation-success?reference=${reference}`,
          process.env.NEXTAUTH_URL
        )
      );
    } else {
      // Payment failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });

      return NextResponse.redirect(
        new URL(
          `/activation-failed?reference=${reference}`,
          process.env.NEXTAUTH_URL
        )
      );
    }
  } catch (error) {
    console.error("[VERIFY ACTIVATION ERROR]", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Handle Paystack webhook
  try {
    const body = await request.json();
    const { data } = body;

    if (!data?.reference) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { reference: data.reference },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (data.status === "success") {
      await prisma.agent.update({
        where: { id: transaction.agentId! },
        data: {
          status: "ACTIVATED",
          activatedAt: new Date(),
        },
      });

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          verifiedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WEBHOOK ERROR]", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
