"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, ShoppingCart } from "lucide-react";

const checkoutSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d+\s\-()]*$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  network: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface Product {
  id: string;
  name: string;
  price: number;
  network?: string;
  capacity?: string;
}

interface CheckoutModalProps {
  product: Product;
  agentSlug: string;
  onClose: () => void;
}

export default function CheckoutModal({
  product,
  agentSlug,
  onClose,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Call the API route to initialize Paystack checkout for product purchase
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
            network: product.network,
            capacity: product.capacity,
          },
          agentSlug,
          email: data.email || "",
          phone: data.phone,
          network: product.network || data.network,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to initialize payment");
        setLoading(false);
        return;
      }

      // In dev mode, show success page instead of redirecting
      if (result._dev_mode) {
        window.location.href = `/order-success?reference=${result.reference}&agentSlug=${agentSlug}`;
        return;
      }

      // Production: Redirect to Paystack payment page
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        setError("Failed to get payment link");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Checkout failed. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between gradient-primary">
          <div className="flex items-center gap-2 text-white">
            <ShoppingCart size={18} className="flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold">Complete Purchase</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4">
          {/* Product Summary */}
          <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-light-purple rounded-lg sm:rounded-xl border border-indigo-200">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Product</p>
            <p className="text-base sm:text-lg font-bold text-primary">
              {product.name}
            </p>
            {product.network && product.capacity && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                <span className="inline-block px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] sm:text-xs rounded mr-1.5">
                  {product.network}
                </span>
                <span className="inline-block px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] sm:text-xs rounded">
                  {product.capacity}GB
                </span>
              </p>
            )}
            <p className="text-2xl sm:text-3xl font-bold text-primary mt-2 sm:mt-3">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Checkout Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Recipient Phone Number *
              </label>
              <input
                type="tel"
                placeholder="0550123456"
                {...register("phone")}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {errors.phone && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                {...register("email")}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 sm:py-3 gradient-primary text-white font-semibold text-sm sm:text-base rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-4 font-medium">
            🔒 Secure payment powered by Paystack
          </p>
        </div>
      </div>
    </div>
  );
}
