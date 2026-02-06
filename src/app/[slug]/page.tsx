import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Phone, MapPin } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function AgentShop({ params }: PageProps) {
  const { slug } = await params;

  // Fetch agent by slug
  let agent: any = null;
  try {
    agent = await prisma.agent.findUnique({
      where: { slug },
      include: {
        products: true,
      },
    });
  } catch (error) {
    // Fallback for development when database is not available
    console.error("Database error, using mock data:", error);
    agent = null;
  }

  if (!agent || agent.status !== "ACTIVATED") {
    notFound();
  }

  // Get products - either from our database or from DataMart API
  const products = agent.products.length > 0
    ? agent.products
    : [
        {
          id: "telecel-1gb",
          name: "Vodafone 1GB",
          network: "TELECEL",
          capacity: "1",
          price: 3.5,
          description: "1GB valid for 30 days",
          image: "https://via.placeholder.com/200x200?text=Vodafone+1GB",
        },
        {
          id: "telecel-5gb",
          name: "Vodafone 5GB",
          network: "TELECEL",
          capacity: "5",
          price: 15.0,
          description: "5GB valid for 30 days",
          image: "https://via.placeholder.com/200x200?text=Vodafone+5GB",
        },
        {
          id: "mtn-1gb",
          name: "MTN 1GB",
          network: "YELLO",
          capacity: "1",
          price: 3.5,
          description: "1GB valid for 30 days",
          image: "https://via.placeholder.com/200x200?text=MTN+1GB",
        },
        {
          id: "mtn-5gb",
          name: "MTN 5GB",
          network: "YELLO",
          capacity: "5",
          price: 15.0,
          description: "5GB valid for 30 days",
          image: "https://via.placeholder.com/200x200?text=MTN+5GB",
        },
      ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">₵</span>
            </div>
            <span className="text-xl font-bold text-primary">BuyData</span>
          </Link>
        </div>
      </nav>

      {/* Agent Banner */}
      <div className="relative bg-gradient-to-r from-primary to-accent h-40 md:h-56">
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
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10 mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Logo */}
            {agent.logo ? (
              <img
                src={agent.logo}
                alt={agent.name}
                className="w-24 h-24 rounded-xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {agent.name.charAt(0)}
                </span>
              </div>
            )}

            {/* Agent Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary mb-2">
                {agent.businessName || agent.name}
              </h1>
              {agent.description && (
                <p className="text-gray-600 mb-4">{agent.description}</p>
              )}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone size={18} className="text-primary" />
                  <span>{agent.phone}</span>
                </div>
                {agent.name && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={18} className="text-primary" />
                    <span>Ghana</span>
                  </div>
                )}
              </div>
            </div>

            {/* Commission Info */}
            <div className="bg-light-purple rounded-xl p-6 border border-indigo-200">
              <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
              <p className="text-3xl font-bold text-primary">
                {(agent.commissionRate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-primary mb-8">
          Available Data Packages
        </h2>

        {products.length === 0 ? (
          <div className="bg-light-purple rounded-xl p-8 text-center border border-indigo-200">
            <ShoppingCart className="mx-auto text-primary mb-4" size={32} />
            <p className="text-gray-600">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id || product.productId,
                  name: product.name,
                  network: product.network,
                  capacity: product.capacity,
                  price: product.price,
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
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© 2026 {agent.businessName || agent.name}. Powered by BuyData.</p>
          <p className="text-sm mt-2">Secure payments via Paystack | Data by DataMart</p>
        </div>
      </footer>
    </div>
  );
}
