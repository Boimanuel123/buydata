"use client";

import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
}

interface ProductGridProps {
  products: Product[];
  agentSlug?: string;
}

export default function ProductGrid({
  products,
  agentSlug = "",
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-slate-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M4 12l8 4m8-4l-8 4"
          />
        </svg>
        <h3 className="text-lg font-medium text-slate-700 mb-2">
          No products available
        </h3>
        <p className="text-slate-500">Check back soon for data packages</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 sm:mb-8">
        Available Data Packages
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            agentSlug={agentSlug}
          />
        ))}
      </div>
    </div>
  );
}
