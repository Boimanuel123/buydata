"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StoreHeader from "@/components/StoreHeader";
import ProductGrid from "@/components/ProductGrid";
import NoStoreError from "@/components/NoStoreError";
import { validateStore, fetchStoreData } from "@/lib/storeApi";

interface StoreData {
  store_slug: string;
  agent_id: string;
  store_name: string;
  description?: string;
  logo?: string;
  whatsapp?: string;
  email?: string;
  color_theme?: string;
  products?: any[];
}

export default function StorePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Invalid store slug");
      setLoading(false);
      return;
    }

    const initializeStore = async () => {
      try {
        // Layer 2: Server-side validation
        const validation = await validateStore(slug);

        if (!validation.valid) {
          setError("Store not found or inactive");
          setLoading(false);
          return;
        }

        // Fetch complete store data
        const data = await fetchStoreData(slug);
        setStoreData(data);
        setError(null);
      } catch (err) {
        setError("Failed to load store");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeStore();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-slate-600 mt-4">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !storeData) {
    return <NoStoreError message={error} />;
  }

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{
        "--color-primary": storeData.color_theme || "#2563eb",
      } as React.CSSProperties}
    >
      <StoreHeader
        storeName={storeData.store_name}
        logo={storeData.logo}
        description={storeData.description}
        whatsapp={storeData.whatsapp}
      />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <ProductGrid
          products={storeData.products || []}
        />
      </main>
    </div>
  );
}
