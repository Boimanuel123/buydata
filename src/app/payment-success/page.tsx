"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const reference = searchParams.get("reference");
    const status = searchParams.get("status");

    if (reference) {
      setPaymentData({
        reference,
        status: status || "completed",
        timestamp: new Date().toLocaleString(),
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-green-600 mb-2">
          Payment Successful!
        </h1>
        <p className="text-center text-slate-600 mb-6">
          Your data bundle order has been placed successfully.
        </p>

        {paymentData && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-3">
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">
                Transaction Reference
              </p>
              <p className="text-sm font-mono text-slate-900 break-all">
                {paymentData.reference}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">
                Status
              </p>
              <p className="text-sm text-green-600 font-semibold capitalize">
                ✓ {paymentData.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">
                Time
              </p>
              <p className="text-sm text-slate-900">{paymentData.timestamp}</p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Next Steps:</strong> Your order has been sent to DataMart
            Ghana. Your data will be delivered shortly. Check your email for
            order confirmation.
          </p>
        </div>

        <Link
          href="/"
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-center block"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-600">Loading payment details...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
