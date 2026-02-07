"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";

interface Order {
  id: string;
  productName: string;
  price: number;
  commission: number;
  agentEarning: number;
  customerPhone: string;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    // For now, we'll use mock data or fetch from agent profile
    // In a real scenario, you'd get orders for this specific agent
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      // Mock orders data for now
      // In production, you'd fetch from /api/agent/orders
      setOrders([
        {
          id: "order-1",
          productName: "Vodafone 1GB",
          price: 3.5,
          commission: 0.35,
          agentEarning: 3.15,
          customerPhone: "0501234567",
          status: "COMPLETED",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "order-2",
          productName: "MTN 5GB",
          price: 15.0,
          commission: 1.5,
          agentEarning: 13.5,
          customerPhone: "0551234567",
          status: "COMPLETED",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    router.push("/login");
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircle className="text-green-600" size={20} />;
      case "PENDING":
        return <Clock className="text-yellow-600" size={20} />;
      case "FAILED":
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-50 border-green-200";
      case "PENDING":
        return "bg-yellow-50 border-yellow-200";
      case "FAILED":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "text-green-700";
      case "PENDING":
        return "text-yellow-700";
      case "FAILED":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft size={20} />
              Back
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">₵</span>
                </div>
                <span className="text-xl font-bold text-primary">BuyData</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Order History</h1>
          <p className="text-gray-600">View all your orders and their status</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-200 text-center">
            <p className="text-gray-600 mb-4">No orders yet</p>
            <Link
              href="/dashboard"
              className="text-primary hover:underline font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-2xl shadow p-6 border border-gray-200 ${getStatusColor(
                  order.status
                )}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {order.productName}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Recipient Number</p>
                            <p className="font-mono font-semibold text-gray-900">
                              {order.customerPhone}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Order Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`text-sm font-semibold ${getStatusTextColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Details */}
                  <div className="md:text-right">
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Package Price</p>
                      <p className="text-xl font-bold text-gray-900">
                        GH₵ {order.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Your Earning</p>
                      <p className="text-lg font-semibold text-green-600">
                        GH₵ {order.agentEarning.toFixed(2)}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-300">
                      <p className="text-sm text-gray-600">Commission</p>
                      <p className="text-2xl font-bold text-primary">
                        GH₵ {order.commission.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
