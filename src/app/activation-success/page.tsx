"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function ActivationSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyAndFetch = async () => {
      try {
        if (!reference) {
          setError("No payment reference found");
          setVerifying(false);
          setLoading(false);
          return;
        }

        // Verify payment with backend
        const verifyResponse = await fetch("/api/activation/payment-callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference: reference,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
          setError(verifyData.error || "Payment verification failed");
          setVerifying(false);
          setLoading(false);
          return;
        }

        setSuccess(true);
        setVerifying(false);

        // Fetch agent details to show their unique link
        const res = await fetch("/api/agent/profile", {
          headers: {
            Authorization: `Bearer ${verifyData.agent.id}`,
          },
        });

        const data = await res.json();
        if (data.agent) {
          setAgent(data.agent);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("An error occurred during verification");
        setVerifying(false);
        setLoading(false);
      }
    };

    verifyAndFetch();
  }, [reference]);

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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Verifying State */}
          {verifying && (
            <>
              <div className="flex justify-center mb-6">
                <Loader className="text-primary animate-spin" size={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Verifying Payment
              </h1>
              <p className="text-gray-600 text-center">
                Processing your account activation...
              </p>
            </>
          )}

          {/* Success State */}
          {success && !verifying && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={32} />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-green-600 text-center mb-2">
                Account Activated!
              </h1>
              <p className="text-gray-600 text-center mb-2">
                Congratulations! Your account has been successfully activated.
              </p>
              <p className="text-sm text-gray-500 text-center mb-6">
                Transaction Reference: <span className="font-mono font-bold">{reference}</span>
              </p>

              {/* Your Link Box */}
              {loading ? (
                <div className="bg-light-purple rounded-xl p-6 mb-6 border border-indigo-200 animate-pulse">
                  <p className="text-sm text-gray-500 mb-2">Loading your agent link...</p>
                </div>
              ) : agent ? (
                <div className="bg-light-purple rounded-xl p-6 mb-6 border border-indigo-200">
                  <p className="text-sm text-gray-600 mb-2">Your Agent Link</p>
                  <div className="bg-white rounded-lg p-4 border-l-4 border-primary">
                    <p className="text-sm font-mono text-primary font-bold break-all">
                      buydata.shop/{agent.slug}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Share this link with customers so they can purchase data through your store.
                  </p>
                </div>
              ) : null}

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li>1. Go to your dashboard</li>
                  <li>2. Customize your agent profile</li>
                  <li>3. Share your link with customers</li>
                  <li>4. Earn commissions on sales</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <Link
                href="/dashboard"
                className="block w-full gradient-primary text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all text-center mb-3"
              >
                Go to Dashboard
              </Link>

              <button
                onClick={() => {
                  if (agent) {
                    navigator.clipboard.writeText(`buydata.shop/${agent.slug}`);
                    alert("Link copied to clipboard!");
                  }
                }}
                className="w-full px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-light-purple transition-all font-semibold"
              >
                Copy Your Link
              </button>
            </>
          )}

          {/* Error State */}
          {error && !verifying && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={32} />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-red-600 text-center mb-2">
                Verification Failed
              </h1>
              <p className="text-red-600 text-center mb-6">
                {error}
              </p>

              {/* Action Buttons */}
              <Link
                href="/dashboard"
                className="block w-full gradient-primary text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all text-center"
              >
                Back to Dashboard
              </Link>
            </>
          )}
        </div>

        {/* Tips */}
        {success && !verifying && (
          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-primary mb-3">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Share your link on WhatsApp, Instagram, TikTok</li>
              <li>✓ Offer bulk discounts to attract more customers</li>
              <li>✓ Respond quickly to customer messages</li>
              <li>✓ Withdraw earnings to your mobile wallet</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivationSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin" size={48} /></div>}>
      <ActivationSuccessContent />
    </Suspense>
  );
}
