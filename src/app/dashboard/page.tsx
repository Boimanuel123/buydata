"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Copy,
  TrendingUp,
  ShoppingBag,
  Wallet,
  Settings,
  ExternalLink,
} from "lucide-react";
import { useUser } from "@/lib/user-context";

export const dynamic = "force-dynamic";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName?: string;
  description?: string;
  slug: string;
  status: string;
  totalEarned: number;
  totalWithdrawn: number;
  totalOrders?: number;
  balance: number;
  commissionRate: number;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, agent, loading, error, signOut, refreshAgent } = useUser();
  const [copied, setCopied] = useState(false);
  const [activating, setActivating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log("[DASHBOARD] Checking auth - loading:", loading, "user exists:", !!user);
    if (!loading && !user) {
      console.log("[DASHBOARD] No user and not loading, redirecting to login");
      router.push("/login");
    }
  }, [user, loading, router]);

  // Force refresh profile on mount and when returning from activation
  useEffect(() => {
    const refresh = async () => {
      if (user) {
        setRefreshing(true);
        await refreshAgent();
        setRefreshing(false);
      }
    };

    if (searchParams.get("activated") === "true" || searchParams.get("welcome") === "true") {
      console.log("[DASHBOARD] Activation detected, forcing refresh");
      refresh();
    }
  }, [searchParams, user, refreshAgent]);

  // Auto-refresh profile on page load to get latest status
  useEffect(() => {
    const refresh = async () => {
      if (user) {
        console.log("[DASHBOARD] Auto-refreshing agent profile on mount");
        await refreshAgent();
      }
    };

    if (user && agent) {
      refresh();
    }
  }, []);

  // Load packages to show pricing info
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const response = await fetch("/api/packages");
        const data = await response.json();
        if (data.packages) {
          setPackages(data.packages);
        }
      } catch (err) {
        console.error("Error loading packages:", err);
      } finally {
        setLoadingPackages(false);
      }
    };

    if (agent?.status === "ACTIVATED") {
      loadPackages();
    }
  }, [agent?.status]);

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    await refreshAgent();
    setRefreshing(false);
  };

  const agentLink = agent ? `buydata.shop/${agent.slug}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(agentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const handleActivateNow = async () => {
    if (!agent || !user) return;

    setActivating(true);
    try {
      // Initialize Paystack payment with user details from context
      const response = await fetch("/api/activation/payment-init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.uid}`,
        },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          name: agent.name,
          businessName: agent.businessName || "",
          phone: agent.phone || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Failed to initialize payment. Please try again.");
        setActivating(false);
        return;
      }

      // Redirect to Paystack payment page
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error("Activation error:", error);
      alert("An error occurred. Please try again.");
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-accent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-gray-600 mb-4">
            {error || "Failed to load your profile. Please try again."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefreshProfile}
              disabled={refreshing}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
            >
              {refreshing ? "Retrying..." : "Retry"}
            </button>
            <Link href="/" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-semibold">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">₵</span>
            </div>
            <span className="text-xl font-bold text-primary">BuyData</span>
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
        {/* PENDING STATUS VIEW */}
        {agent.status === "PENDING" && (
          <>
            {/* Your Shop Link Section */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-primary mb-4">Your Shop Link</h2>
              <div className="bg-light-purple rounded-xl p-6 border border-indigo-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-4">
                      Your shop will be available once your account is activated. Complete your activation to start receiving orders.
                    </p>
                  </div>
                  <div className="flex gap-3 whitespace-nowrap flex-shrink-0">
                    <button
                      onClick={handleActivateNow}
                      disabled={activating}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {activating ? "Processing..." : "Activate Now"}
                    </button>
                    <button
                      onClick={handleRefreshProfile}
                      disabled={refreshing}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh to check if activation is complete"
                    >
                      {refreshing ? "..." : "🔄 Refresh"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">Profile</h2>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-4 py-2 bg-light-purple text-primary rounded-lg hover:bg-indigo-200 transition-all font-semibold"
                >
                  <Settings size={18} />
                  Edit Profile
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">{agent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{agent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">{agent.phone || "Not set"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Business Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {agent.businessName || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Agent ID</p>
                    <p className="text-lg font-mono font-semibold text-gray-900">
                      {agent.slug}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Status</p>
                    <p className="text-lg font-semibold">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                        ✓ PENDING
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href={`/${agent.slug}`}
                className="bg-white rounded-2xl shadow p-6 border border-gray-200 hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">
                      Visit Your Shop
                    </h3>
                    <p className="text-gray-600 text-sm">
                      See how customers view your store
                    </p>
                  </div>
                  <ExternalLink className="text-primary" size={24} />
                </div>
              </Link>

              <Link
                href="/dashboard/orders"
                className="bg-white rounded-2xl shadow p-6 border border-gray-200 hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">
                      View Orders
                    </h3>
                    <p className="text-gray-600 text-sm">
                      See all customer orders and earnings
                    </p>
                  </div>
                  <ShoppingBag className="text-primary" size={24} />
                </div>
              </Link>
            </div>
          </>
        )}

        {/* ACTIVE STATUS VIEW */}
        {agent.status === "ACTIVATED" && (
          <>
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link
                href="/dashboard/pricing"
                className="bg-primary text-white rounded-2xl shadow p-8 border border-primary hover:shadow-lg transition-all text-center"
              >
                <div className="text-4xl mb-2">💰</div>
                <h3 className="text-2xl font-bold mb-2">Set Your Prices</h3>
                <p className="text-sm text-indigo-100">
                  Customize prices for packages and earn commission on each sale
                </p>
              </Link>

              <Link
                href="/dashboard/orders"
                className="bg-white rounded-2xl shadow p-8 border border-gray-200 hover:shadow-lg transition-all text-center"
              >
                <div className="text-4xl mb-2">📦</div>
                <h3 className="text-2xl font-bold text-primary mb-2">View Orders</h3>
                <p className="text-sm text-gray-600">
                  Track all customer orders and earnings
                </p>
              </Link>
            </div>

            {/* Agent Link Section */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-primary mb-4">Your Shop Link</h2>
              <div className="bg-light-purple rounded-xl p-6 border border-indigo-200">
                <p className="text-sm text-gray-600 mb-2">Share this link with customers</p>
                <div className="flex gap-3 items-center">
                  <code className="flex-1 bg-white px-4 py-3 rounded-lg border border-gray-300 font-mono font-bold text-primary break-all">
                    {agentLink}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-3 bg-primary text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2 flex-shrink-0"
                  >
                    <Copy size={18} />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  label: "Total Earned",
                  value: `GH₵ ${agent.totalEarned.toFixed(2)}`,
                  icon: TrendingUp,
                  color: "bg-green-50",
                  borderColor: "border-green-200",
                },
                {
                  label: "Current Balance",
                  value: `GH₵ ${agent.balance.toFixed(2)}`,
                  icon: Wallet,
                  color: "bg-blue-50",
                  borderColor: "border-blue-200",
                },
                {
                  label: "Withdrawn",
                  value: `GH₵ ${agent.totalWithdrawn.toFixed(2)}`,
                  icon: ShoppingBag,
                  color: "bg-purple-50",
                  borderColor: "border-purple-200",
                },
                {
                  label: "Total number of Orders",
                  value: agent.totalOrders?.toString() || "0",
                  icon: ShoppingBag,
                  color: "bg-amber-50",
                  borderColor: "border-amber-200",
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`${stat.color} rounded-xl p-6 border ${stat.borderColor}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <Icon className="text-primary" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Pricing Summary Section */}
            {!loadingPackages && packages.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6 mb-8 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary">Your Package Pricing</h2>
                  <Link
                    href="/dashboard/pricing"
                    className="flex items-center gap-2 px-4 py-2 bg-light-purple text-primary rounded-lg hover:bg-indigo-200 transition-all font-semibold"
                  >
                    <Settings size={18} />
                    Edit Prices
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Package</th>
                        <th className="text-right py-3 px-4 text-gray-600 font-semibold">Base Price</th>
                        <th className="text-right py-3 px-4 text-gray-600 font-semibold">Your Price</th>
                        <th className="text-right py-3 px-4 text-gray-600 font-semibold">Commission/Sale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.map((pkg) => {
                        const agentPrice = agent?.agentPrices?.[pkg.id] || pkg.basePrice;
                        const commission = agentPrice - pkg.basePrice;
                        return (
                          <tr key={pkg.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-semibold text-gray-900">{pkg.name}</p>
                                <p className="text-xs text-gray-500">{pkg.network} • {pkg.capacity}</p>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4 text-gray-700 font-medium">GH₵ {pkg.basePrice.toFixed(2)}</td>
                            <td className="text-right py-4 px-4">
                              <span className="font-semibold text-primary">GH₵ {agentPrice.toFixed(2)}</span>
                            </td>
                            <td className="text-right py-4 px-4">
                              <span className={`font-semibold ${commission > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                GH₵ {commission.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">How it works:</span> Your commission is the difference between your set price and the base price. 
                    Higher prices = higher commissions. Click "Edit Prices" to adjust your pricing strategy.
                  </p>
                </div>
              </div>
            )}

            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">Profile</h2>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-4 py-2 bg-light-purple text-primary rounded-lg hover:bg-indigo-200 transition-all font-semibold"
                >
                  <Settings size={18} />
                  Edit Profile
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">{agent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{agent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">{agent.phone || "Not set"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Business Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {agent.businessName || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Agent ID</p>
                    <p className="text-lg font-mono font-semibold text-gray-900">
                      {agent.slug}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Status</p>
                    <p className="text-lg font-semibold">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        ✓ Active
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Link
                href={`/${agent.slug}`}
                className="bg-white rounded-2xl shadow p-6 border border-gray-200 hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">
                      Visit Your Shop
                    </h3>
                    <p className="text-gray-600 text-sm">
                      See how customers view your store
                    </p>
                  </div>
                  <ExternalLink className="text-primary" size={24} />
                </div>
              </Link>

              <Link
                href="/dashboard/orders"
                className="bg-white rounded-2xl shadow p-6 border border-gray-200 hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">
                      View Orders
                    </h3>
                    <p className="text-gray-600 text-sm">
                      See all customer orders and earnings
                    </p>
                  </div>
                  <ShoppingBag className="text-primary" size={24} />
                </div>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
