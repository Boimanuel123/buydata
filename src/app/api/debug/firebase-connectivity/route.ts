import { NextRequest, NextResponse } from "next/server";

/**
 * Diagnostic endpoint to test Firebase and Google API connectivity
 */
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  // Test 1: Check if we can reach Google APIs
  try {
    const googleResponse = await fetch("https://www.google.com/", {
      method: "HEAD",
    });
    results.tests.google = {
      status: googleResponse.status,
      success: googleResponse.ok,
    };
  } catch (error) {
    results.tests.google = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Test 2: Check if we can reach Firebase Identity Toolkit
  try {
    const firebaseResponse = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=test",
      { method: "POST" }
    );
    results.tests.firebase_identity = {
      status: firebaseResponse.status,
      success: firebaseResponse.ok || firebaseResponse.status === 400, // 400 is expected with invalid key
    };
  } catch (error) {
    results.tests.firebase_identity = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Test 3: Check if we can reach Firebase Project
  try {
    const projectResponse = await fetch(
      `https://buydata-60e43.firebaseapp.com/__/auth/handler`
    );
    results.tests.firebase_project = {
      status: projectResponse.status,
      success: projectResponse.ok,
    };
  } catch (error) {
    results.tests.firebase_project = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Test 4: DNS check
  try {
    const dnsResponse = await fetch(
      "https://dns.google/resolve?name=identitytoolkit.googleapis.com"
    );
    results.tests.dns = {
      success: dnsResponse.ok,
    };
  } catch (error) {
    results.tests.dns = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  return NextResponse.json(results);
}
