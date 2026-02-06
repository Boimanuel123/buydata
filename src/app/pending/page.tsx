"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Pending() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleActivate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/activation/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to initialize payment");
        setLoading(false);
        return;
      }

      // Redirect to Paystack or dev payment page
      if (data._dev_mode) {
        router.push(data.authorization_url);
      } else {
        window.location.href = data.authorization_url;
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">₵</span>
          </div>
          <span className="text-2xl font-bold text-primary">BuyData</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="text-yellow-600" size={32} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-primary text-center mb-2">
            Your Account is Pending
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Congratulations on signing up! Complete your account activation to start earning.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-light-purple rounded-xl p-6 mb-6 border border-indigo-200">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pay Activation Fee</h3>
                  <p className="text-sm text-gray-600">Pay GH₵20 to activate your account</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Get Your Link</h3>
                  <p className="text-sm text-gray-600">
                    Receive your unique agent link to share
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Start Earning</h3>
                  <p className="text-sm text-gray-600">
                    Accept orders and earn 10% commission
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Box */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Activation Fee</p>
            <div className="text-4xl font-bold text-green-600">GH₵ 20</div>
            <p className="text-xs text-gray-600 mt-2">One-time payment. Secure payment via Paystack.</p>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleActivate}
            disabled={loading}
            className="w-full gradient-primary text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>

          <Link
            href="/"
            className="block w-full text-center px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-all font-semibold"
          >
            Back to Home
          </Link>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <div className="flex gap-3 items-start">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-gray-700 text-sm">Secure payment processed by Paystack</span>
          </div>
          <div className="flex gap-3 items-start">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-gray-700 text-sm">Start earning immediately after activation</span>
          </div>
          <div className="flex gap-3 items-start">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-gray-700 text-sm">Full support for your business</span>
          </div>
        </div>
      </div>
    </div>
  );
}
