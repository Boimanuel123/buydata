import { NextRequest, NextResponse } from "next/server";

/**
 * Simple test endpoint - returns a message
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST endpoint to test activation callback
 * Usage: POST /api/test/health
 * Body: { reference: "test-ref-123" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[TEST-HEALTH] POST request received:", JSON.stringify(body));
    
    return NextResponse.json({
      success: true,
      received: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[TEST-HEALTH] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
