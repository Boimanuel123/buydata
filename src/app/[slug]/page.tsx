"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Phone, MapPin } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface Agent {
  id: string;
  name: string;
  email: string;
  businessName: string;
  phone: string;
  description: string;
  slug: string;
  status: string;
  totalEarned: number;
  totalOrders: number;
  logo?: string;
  coverImage?: string;
}

interface Package {
  id: string;
  name: string;
  network: string;
  capacity: string;
  basePrice: number;
  agentPrice: number;
  description?: string;
  image?: string;
}

export default function AgentShop() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [products, setProducts] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchAgentStore = async () => {
      try {
        setLoading(true);
        // Fetch agent store data with custom pricing
        const response = await fetch(`/api/shops/${slug}`);
        
        if (!response.ok) {
          setError("Agent store not found or not activated.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        setAgent({
          id: data.agent_id,
          name: data.agent_name,
          email: data.agent_email,
          businessName: data.store_name,
          phone: data.agent_phone,
          description: data.agent_description,
          slug: data.store_slug,
          status: data.status,
          totalEarned: data.total_earned || 0,
          totalOrders: data.total_orders || 0,
          logo: data.agent_logo,
          coverImage: data.agent_cover,
        });

        setProducts(
          data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            network: p.network,
            capacity: p.capacity,
            basePrice: p.basePrice,
            agentPrice: p.agentPrice || p.basePrice,
            description: p.description || `${p.capacity} valid for 30 days`,
            image: p.image,
          }))
        );
      } catch (err) {
        console.error("Error fetching agent store:", err);
        setError("Failed to load store. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentStore();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-accent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">{error || "Store not found"}</p>
          <Link href="/" className="text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-lg">₵</span>
            </div>
            <span className="text-base sm:text-xl font-bold text-primary hidden xs:inline">BuyData</span>
          </Link>
        </div>
      </nav>

      {/* Agent Banner */}
      <div className="relative bg-gradient-to-r from-primary to-accent h-32 sm:h-40 md:h-56">
        {agent.coverImage && (
          <img
            src={agent.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Agent Info Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 -mt-16 sm:-mt-20 relative z-10 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
            {/* Logo */}
            {agent.logo ? (
              <img
                src={agent.logo}
                alt={agent.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl sm:text-3xl font-bold">
                  {agent.businessName?.charAt(0) || agent.name?.charAt(0)}
                </span>
              </div>
            )}

            {/* Agent Details */}
            <div className="flex-1 w-full">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2 line-clamp-2">
                {agent.businessName || agent.name}
              </h1>
              {agent.description && (
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{agent.description}</p>
              )}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                  <Phone size={16} className="text-primary flex-shrink-0" />
                  <span className="truncate">{agent.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                  <MapPin size={16} className="text-primary flex-shrink-0" />
                  <span>Ghana</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-8">
          Available Data Packages
        </h2>

        {products.length === 0 ? (
          <div className="bg-light-purple rounded-lg sm:rounded-xl p-6 sm:p-8 text-center border border-indigo-200">
            <ShoppingCart className="mx-auto text-primary mb-4" size={32} />
            <p className="text-gray-600 text-sm sm:text-base">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  network: product.network,
                  capacity: product.capacity,
                  price: product.agentPrice,
                  description: product.description,
                  image: product.image,
                }}
                agentSlug={slug}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 sm:py-8 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center text-gray-600 text-xs sm:text-sm">
          <p>© 2026 {agent.businessName || agent.name}</p>
        </div>
      </footer>
    </div>
  );
}
