import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { generateReference, convertToKobo } from "@/lib/utils";

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product,
      agentSlug,
      email,
      phone,
      network,
    } = body;

    if (!product || !agentSlug || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find agent by slug
    const agent = await prisma.agent.findUnique({
      where: { slug: agentSlug },
    });

    if (!agent || agent.status !== "ACTIVATED") {
      return NextResponse.json(
        { error: "Agent not found or not activated" },
        { status: 404 }
      );
    }

    // Calculate commission and agent earning
    const commission = product.price * agent.commissionRate;
    const agentEarning = product.price - commission;

    // Create order
    const order = await prisma.order.create({
      data: {
        agentId: agent.id,
        customerEmail: email || "unknown@example.com",
        customerPhone: phone,
        productId: product.id,
        productName: product.name,
        network: network || product.network || "",
        capacity: product.capacity || "",
        price: product.price,
        commission,
        agentEarning,
        status: "PENDING",
      },
    });

    const amountKobo = convertToKobo(product.price);
    const reference = generateReference("order");

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        type: "ORDER",
        reference,
        amount: product.price,
        amountKobo,
        status: "INITIALIZED",
        orderId: order.id,
      },
    });

    // Dev mode: return mock response
    if (DEV_MODE) {
      return NextResponse.json({
        success: true,
        authorization_url: `/order-success?reference=${reference}&status=completed&agentSlug=${agentSlug}`,
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
          email: email || phone,
          amount: amountKobo,
          reference,
          metadata: {
            orderId: order.id,
            agentId: agent.id,
            agentSlug,
            customerPhone: phone,
            productName: product.name,
            network: network || product.network,
            type: "ORDER",
          },
          callback_url: `${process.env.NEXTAUTH_URL}/api/orders/verify`,
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
    console.error("[ORDER CHECKOUT ERROR]", error);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
