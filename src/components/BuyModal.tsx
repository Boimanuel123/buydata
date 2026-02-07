"use client";

import { useState } from "react";
import { X, Loader } from "lucide-react";

interface BuyModalProps {
  product: {
    id: string;
    name: string;
    price: number;
    description?: string;
  };
  agentSlug: string;
  onClose: () => void;
}

export default function BuyModal({ product, agentSlug, onClose }: BuyModalProps) {
  const [recipientNumber, setRecipientNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceCharge = product.price * 0.03;
  const totalAmount = product.price + serviceCharge;

  const handleBuy = async () => {
    // Validate phone number
    if (!recipientNumber.trim()) {
      setError("Please enter a recipient phone number");
      return;
    }

    if (recipientNumber.trim().length < 10) {
      setError("Phone number must be at least 10 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user email from localStorage if available
      const userStr = localStorage.getItem("authUser");
      const userEmail = userStr ? JSON.parse(userStr).email : undefined;

      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
          },
          agentSlug,
          email: userEmail || undefined,
          phone: recipientNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to process checkout");
        setLoading(false);
        return;
      }

      // Redirect to Paystack payment page
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary">Checkout</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Summary */}
          <div className="bg-light-purple rounded-xl p-4 border border-indigo-200">
            <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-gray-600 mb-3">{product.description}</p>
            )}
            <div className="pt-3 border-t border-indigo-300">
              <p className="text-sm text-gray-600">Package Price</p>
              <p className="text-2xl font-bold text-primary">
                GH₵ {product.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Recipient Number Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Recipient Phone Number
            </label>
            <input
              type="tel"
              value={recipientNumber}
              onChange={(e) => {
                setRecipientNumber(e.target.value);
                setError(null);
              }}
              placeholder="e.g., 0501234567"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              The phone number where the data will be delivered
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Package Price</span>
              <span className="font-semibold text-gray-900">
                GH₵ {product.price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service Charge (3%)</span>
              <span className="font-semibold text-gray-900">
                GH₵ {serviceCharge.toFixed(2)}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="text-xl font-bold text-primary">
                GH₵ {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Terms */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>✓ Secure payment via Paystack</p>
            <p>✓ Data will be delivered within minutes after payment</p>
            <p>✓ No refunds on data purchases</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleBuy}
              disabled={loading}
              className="flex-1 px-4 py-3 gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {loading ? "Processing..." : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
