/* eslint-disable react/no-unescaped-entities */
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const agentSlug = searchParams.get("agentSlug");
  const status = searchParams.get("status");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">₵</span>
          </div>
          <span className="text-2xl font-bold text-primary">BuyData</span>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="text-green-600" size={32} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-green-600 text-center mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Your data purchase has been completed successfully.
          </p>

          {/* Transaction Details */}
          <div className="bg-light-purple rounded-xl p-6 mb-6 border border-indigo-200">
            <div className="space-y-3">
              {reference && (
                <div>
                  <p className="text-sm text-gray-600">Order Reference</p>
                  <p className="font-mono font-bold text-primary text-gap">
                    {reference}
                  </p>
                </div>
              )}
              {status && (
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold capitalize">
                    {status}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Next Steps</p>
                <p className="text-sm text-gray-700 mt-1">
                  Your data bundle will be delivered to your phone within 5 minutes via SMS. Check your inbox and junk folder if you don't see it immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
            <p className="text-xs text-blue-700 font-medium">
              ✓ Payment confirmed • ✓ Order processing • ✓ Delivery in progress
            </p>
          </div>

          {/* Action Buttons */}
          {agentSlug && (
            <Link
              href={`/${agentSlug}`}
              className="block w-full text-center gradient-primary text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all mb-3"
            >
              Buy More Data
            </Link>
          )}

          <Link
            href="/"
            className="block w-full text-center px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-light-purple transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-primary mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>Data not arrived?</strong> Check your phone SMS, it may be in your spam folder.
            </p>
            <p>
              <strong>Need a refund?</strong> Contact support within 24 hours with your order reference.
            </p>
            <p>
              <strong>Have a question?</strong> Email us at{" "}
              <a
                href="mailto:support@buydata.shop"
                className="text-primary hover:underline"
              >
                support@buydata.shop
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-green-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-accent animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
