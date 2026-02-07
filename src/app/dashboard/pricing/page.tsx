"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export const dynamic = "force-dynamic";

interface Package {
  id: string;
  name: string;
  capacity: string;
  basePrice: number;
  network: string;
  description?: string;
  image?: string;
}

export default function Pricing() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [agentPrices, setAgentPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    fetchData(user);
  }, [router]);

  const fetchData = async (user: any) => {
    try {
      // Fetch packages
      const packagesRes = await fetch("/api/packages");
      const packagesData = await packagesRes.json();

      if (packagesRes.ok && packagesData.packages) {
        setPackages(packagesData.packages);
      }

      // Fetch agent profile to get current prices
      const profileRes = await fetch(`/api/agent/profile?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${user.uid}`,
        },
      });

      const profileData = profileRes.json();
      profileData.then((data: any) => {
        if (profileRes.ok && data.agent?.agentPrices) {
          setAgentPrices(data.agent.agentPrices || {});
        }
        setLoading(false);
      });
    } catch (err) {
      console.error("[Pricing] Fetch error:", err);
      setError("Failed to load pricing data");
      setLoading(false);
    }
  };

  const handlePriceChange = (packageId: string, newPrice: string) => {
    const price = parseFloat(newPrice) || 0;
    setAgentPrices((prev) => ({
      ...prev,
      [packageId]: Math.max(0, price),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const storedUser = localStorage.getItem("authUser");
      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      const response = await fetch("/api/agent/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.uid}`,
        },
        body: JSON.stringify({
          agentPrices,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save prices");
        setSaving(false);
        return;
      }

      setSuccess(true);
      console.log("[Pricing] Prices saved successfully");

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("[Pricing] Save error:", err);
      setError("An error occurred while saving prices");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-accent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft size={24} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">Set Your Prices</h1>
            <p className="text-gray-600 text-sm">Customize package prices and earn commission on each sale</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm font-medium">Prices saved successfully! Redirecting to dashboard...</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>How it works:</strong> Set your own prices for each package. Your commission = Your Price - Base Price. Example: If base price is GH₵4.50 and you set GH₵6.00, you earn GH₵1.50 per sale.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg) => {
              const agentPrice = agentPrices[pkg.id] || pkg.basePrice;
              const commission = Math.max(0, agentPrice - pkg.basePrice);

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl shadow p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{pkg.name}</h3>
                      <p className="text-sm text-gray-600">{pkg.capacity}</p>
                    </div>
                    <span className="bg-indigo-100 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                      {pkg.network}
                    </span>
                  </div>

                  <div className="space-y-4 mb-6">
                    {/* Base Price - Read Only */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Price (Read-Only)
                      </label>
                      <input
                        type="text"
                        disabled
                        value={`GH₵ ${pkg.basePrice.toFixed(2)}`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* Your Price - Editable */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Price *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-700">GH₵</span>
                        <input
                          type="number"
                          min={pkg.basePrice}
                          step="0.01"
                          value={agentPrice}
                          onChange={(e) => handlePriceChange(pkg.id, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                          placeholder={pkg.basePrice.toString()}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum: GH₵ {pkg.basePrice.toFixed(2)}
                      </p>
                    </div>

                    {/* Your Commission */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Your Commission Per Sale</p>
                      <p className="text-2xl font-bold text-green-600">
                        GH₵ {commission.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Earned for each {pkg.capacity} order through your link
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Box */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-primary mb-4">Commission Summary</h3>
            <div className="space-y-3">
              {packages.map((pkg) => {
                const agentPrice = agentPrices[pkg.id] || pkg.basePrice;
                const commission = Math.max(0, agentPrice - pkg.basePrice);
                return (
                  <div key={pkg.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      {pkg.name} ({pkg.capacity}) @ GH₵{agentPrice.toFixed(2)}
                    </span>
                    <span className="text-green-600 font-bold">+ GH₵{commission.toFixed(2)} per sale</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 gradient-primary text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save & Apply Prices"}
            </button>
            <Link
              href="/dashboard"
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
