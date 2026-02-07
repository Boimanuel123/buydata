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
  agentSlug: string;
}

export default function ProductCard({
  product,
  agentSlug,
}: ProductCardProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <>
      <div className="bg-white rounded-lg sm:rounded-lg border border-gray-200 overflow-hidden hover:border-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* MTN Logo Header */}
        <div className="w-full h-24 sm:h-32 md:h-40 flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#FFCC00" }}>
          <img
            src="/images/New-mtn-logo.jpg"
            alt="MTN"
            style={{ width: "120%", height: "120%", objectFit: "contain" }}
          />
        </div>

        <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-1">
          {/* Network Badge */}
          {product.network && (
            <div className="flex gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <span className="inline-block px-1.5 sm:px-2 py-0.5 bg-primary/10 text-primary text-[10px] sm:text-xs font-bold rounded-full">
                {product.network}
              </span>
              {product.capacity && (
                <span className="inline-block px-1.5 sm:px-2 py-0.5 bg-accent/10 text-accent text-[10px] sm:text-xs font-bold rounded-full">
                  {product.capacity}GB
                </span>
              )}
            </div>
          )}

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-primary mb-0.5 sm:mb-1 line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 text-[10px] sm:text-xs md:text-xs mb-2 sm:mb-3 flex-1 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="mb-2 sm:mb-3">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary leading-tight">
              {formatPrice(product.price)}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Non-Expiry</p>
          </div>

          {/* Buy Button */}
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 gradient-primary text-white font-semibold text-xs sm:text-sm rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-1 group"
          >
            <ShoppingCart size={14} className="sm:group-hover:animate-bounce flex-shrink-0" />
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
