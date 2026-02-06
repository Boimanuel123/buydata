"use client";

import { useState } from "react";
import Image from "next/image";
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
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Product Image */}
        {product.image && (
          <div className="w-full h-48 relative bg-gradient-to-br from-light-purple to-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f0ff' width='200' height='200'/%3E%3C/svg%3E";
              }}
            />
          </div>
        )}

        <div className="p-6 flex flex-col flex-1">
          {/* Network Badge */}
          {product.network && (
            <div className="flex gap-2 mb-3">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                {product.network}
              </span>
              {product.capacity && (
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full">
                  {product.capacity}GB
                </span>
              )}
            </div>
          )}

          {/* Product Name */}
          <h3 className="text-lg font-bold text-primary mb-2">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 text-sm mb-4 flex-1">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="mb-4">
            <p className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Valid for 30 days</p>
          </div>

          {/* Buy Button */}
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full px-4 py-3 gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            <ShoppingCart size={18} className="group-hover:animate-bounce" />
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
