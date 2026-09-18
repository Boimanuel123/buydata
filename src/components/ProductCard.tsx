"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import CheckoutModal from "./CheckoutModal";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  capacity?: string;
  network?: string;
}

interface ProductCardProps {
  product: Product;
  agentSlug?: string;
}

export default function ProductCard({
  product,
  agentSlug,
}: ProductCardProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  const network = product.network?.toUpperCase() || "MTN";
  const networkImage = network === "TELECEL"
    ? "/images/TELECEL.jpg"
    : network === "AT" || network === "AT_PREMIUM" || network === "AIRTELTIGO"
      ? "/images/AT.png"
      : "/images/MTN.jpg";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <>
      <div className="flex h-full min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition-all duration-300 hover:border-primary hover:shadow-md">
        <div className="flex min-h-[128px] flex-col">
          {/* Compact package heading */}
          <div className="flex items-center justify-center gap-2 border-b border-slate-100 pb-2 text-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">
              <img
                src={networkImage}
                alt={`${product.network || "MTN"} logo`}
                className="h-full w-full object-contain"
              />
            </div>
            <h3 className="truncate text-xs font-bold text-slate-900">
              {product.name}
            </h3>
          </div>

          <div className="mt-2 space-y-0.5 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {product.capacity ? `${product.capacity}GB` : product.name}
            </p>
            <p className="text-base font-black leading-tight text-primary">
              {formatPrice(product.price)}
            </p>
            <p className="text-[9px] font-medium text-slate-500">Non-Expiry</p>
          </div>

          {/* Buy Button */}
          <button
            onClick={() => setShowCheckout(true)}
            className="mt-auto flex min-h-10 w-full items-center justify-center gap-1 rounded-md px-2 py-1.5 text-center text-[10px] font-semibold text-white gradient-primary transition-all hover:shadow-lg group"
          >
            <ShoppingCart size={12} className="group-hover:animate-bounce flex-shrink-0" />
            Buy Now
          </button>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          product={product}
          agentSlug={agentSlug}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}
