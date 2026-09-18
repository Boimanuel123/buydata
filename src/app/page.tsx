"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import SupportChat from "@/components/SupportChat";

interface Package {
  id: string;
  name: string;
  description?: string;
  network?: string;
  capacity?: string;
  basePrice: number;
}

export default function Home() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState("MTN");
  const [loading, setLoading] = useState(true);

  const networkTabs = [
    { label: "MTN", value: "MTN" },
    { label: "TELECEL", value: "TELECEL" },
    { label: "AT (AIRTELTIGO)", value: "AT" },
  ];

  const visiblePackages = packages.filter((item) => {
    const network = item.network?.toUpperCase() || "";
    return selectedNetwork === "AT"
      ? network === "AT" || network === "AT_PREMIUM" || network === "AIRTELTIGO"
      : network === selectedNetwork;
  });

  useEffect(() => {
    fetch("/api/packages")
      .then((response) => response.json())
      .then((data) => setPackages(data.packages || []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-black text-white">B</div>
            <span className="text-xl font-black tracking-tight text-slate-950">BUYDATA</span>
          </div>
          <span className="hidden text-sm font-medium text-slate-500 sm:block">Fast data for every network</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 pb-12 pt-8 sm:px-4 sm:pb-16 sm:pt-16">
        <section className="mb-9 max-w-2xl sm:mb-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Instant delivery</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-6xl">Choose your data. Send it anywhere.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">Select a network package, enter the recipient&apos;s number, and pay securely with Paystack.</p>
        </section>

        <section aria-labelledby="packages-heading">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <h2 id="packages-heading" className="text-xl font-black text-slate-950 sm:text-2xl">Network packages</h2>
              <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2" role="tablist" aria-label="Choose a network">
                {networkTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={selectedNetwork === tab.value}
                    onClick={() => setSelectedNetwork(tab.value)}
                    className={`rounded-full border px-3 py-2 text-xs font-bold transition-colors sm:px-4 sm:text-sm ${
                      selectedNetwork === tab.value
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-950 hover:text-slate-950"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <Smartphone className="mb-1 shrink-0 text-emerald-600" aria-hidden="true" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500"><Loader2 className="mr-2 animate-spin" size={20} />Loading packages</div>
          ) : (
            <ProductGrid products={visiblePackages.map((item) => ({ ...item, price: item.basePrice }))} />
          )}
        </section>

        <section className="mt-10 grid gap-4 border-t border-slate-200 pt-8 text-sm text-slate-600 sm:mt-14 sm:grid-cols-3">
          <div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" size={20} />Secure Paystack checkout</div>
          <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={20} />No login or signup</div>
          <div className="flex items-center gap-3"><Smartphone className="text-emerald-600" size={20} />Delivered to your number</div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">© 2026 BUYDATA · Secure payments powered by Paystack</footer>
      <SupportChat />
    </div>
  );
}
