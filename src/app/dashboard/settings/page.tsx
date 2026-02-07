"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

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
  balance: number;
  commissionRate: number;
}

export default function Settings() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    phone: "",
    description: "",
  });

  useEffect(() => {
    // Check if user is authenticated and fetch agent
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    const fetchAgent = async () => {
      try {
        console.log("[Settings] Fetching profile for UID:", user.uid);
        const res = await fetch(`/api/agent/profile?t=${Date.now()}`, {
          headers: {
            Authorization: `Bearer ${user.uid}`,
          },
        });
        const data = await res.json();
        console.log("[Settings] Profile response:", data);

        if (res.ok && data.agent) {
          setAgent(data.agent);
          setFormData({
            businessName: data.agent.businessName || "",
            phone: data.agent.phone || "",
            description: data.agent.description || "",
          });
          setLoading(false);
        } else {
          console.error("[Settings] Failed to load agent:", data.error);
          setError("Failed to load profile");
          setLoading(false);
        }
      } catch (err) {
        console.error("[Settings] Fetch error:", err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    fetchAgent();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess(false);
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

      const response = await fetch("/api/agent/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.uid}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update profile");
        setSaving(false);
        return;
      }

      setSuccess(true);
      console.log("[Settings] Profile updated successfully");

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Update error:", err);
      setError("An error occurred while updating your profile");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-accent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load profile</p>
          <Link href="/dashboard" className="text-primary hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft size={24} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">Edit Profile</h1>
            <p className="text-gray-600 text-sm">Update your business information</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow p-6 md:p-8 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm font-medium">Profile updated successfully! Redirecting...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={agent.name}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Read-only field</p>
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={agent.email}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Read-only field</p>
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Your business name (e.g., SANY DATA)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the name your customers will see
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+233 50 1234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Customers can reach you at this number
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell customers about your business (optional)"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Help customers understand your services
              </p>
            </div>

            {/* Agent ID - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent ID
              </label>
              <input
                type="text"
                disabled
                value={agent.slug}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Your unique shop identifier</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 gradient-primary text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> These details appear on your shop page and in customer communications. Keep them accurate and professional.
          </p>
        </div>
      </main>
    </div>
  );
}
