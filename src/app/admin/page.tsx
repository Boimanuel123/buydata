"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { LogOut, Menu, MessageCircle, Package, X } from "lucide-react";

type Order = {
  id: string;
  productName?: string;
  network?: string;
  capacity?: string;
  customerPhone?: string;
  amount?: number;
  status?: string;
  paystackReference?: string;
  createdAt?: string;
};
type Message = {
  id: string;
  conversationId: string;
  sender: "admin" | "customer";
  message: string;
  customerName?: string;
};
type PackageItem = {
  id: string;
  name: string;
  network: string;
  capacity: string;
  basePrice: number;
  description?: string;
  isActive?: boolean;
};

const networks = ["MTN", "TELECEL", "AT"];

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState("orders");
  const [network, setNetwork] = useState("MTN");
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [reply, setReply] = useState("");
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState({ name: "", network: "MTN", capacity: "", basePrice: "", description: "", isActive: true });

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (response.status === 401) {
        setLoggedIn(false);
        return;
      }
      if (!response.ok) throw new Error("Orders could not be loaded");
      setOrders((await response.json()).orders || []);
    } catch (loadError) {
      console.error(loadError);
      setError("Signed in, but orders could not be loaded. Check your Firebase settings.");
    }
  };

  const loadMessages = async () => {
    const response = await fetch("/api/admin/support");
    if (response.ok) setMessages((await response.json()).messages || []);
  };

  const loadPackages = async () => {
    const response = await fetch("/api/admin/packages");
    if (response.ok) setPackages((await response.json()).packages || []);
  };

  useEffect(() => { loadOrders(); loadPackages(); }, []);

  useEffect(() => {
    if (!loggedIn) return;
    const refresh = window.setInterval(() => {
      loadOrders();
      loadPackages();
      if (section === "support") loadMessages();
    }, 15000);
    return () => window.clearInterval(refresh);
  }, [loggedIn, section]);

  const conversations = useMemo(() => {
    const grouped = new Map<string, Message[]>();
    messages.forEach((message) => {
      grouped.set(message.conversationId, [...(grouped.get(message.conversationId) || []), message]);
    });
    return Array.from(grouped.entries()).map(([id, items]) => ({ id, items, latest: items[items.length - 1] }));
  }, [messages]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      setError("Invalid admin credentials");
      return;
    }
    setLoggedIn(true);
    setPassword("");
    await Promise.all([loadOrders(), loadPackages()]);
  };

  const chooseSection = (value: string) => {
    setSection(value);
    setMenuOpen(false);
    if (value === "support") loadMessages();
    if (value === "packages") loadPackages();
  };

  const savePackage = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch(editingPackage ? `/api/admin/packages/${editingPackage}` : "/api/admin/packages", {
      method: editingPackage ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(packageForm),
    });
    if (!response.ok) return;
    setEditingPackage(null);
    setPackageForm({ name: "", network: "MTN", capacity: "", basePrice: "", description: "", isActive: true });
    await loadPackages();
  };

  const deletePackage = async (id: string) => {
    if (!window.confirm("Delete this package?")) return;
    await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
    await loadPackages();
  };

  const startEditing = (item: PackageItem) => {
    setEditingPackage(item.id);
    setPackageForm({ name: item.name, network: item.network === "AT_PREMIUM" ? "AT" : item.network, capacity: item.capacity, basePrice: String(item.basePrice), description: item.description || "", isActive: item.isActive !== false });
  };

  const sendReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!reply.trim() || !conversationId) return;
    await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, message: reply, sender: "admin" }),
    });
    setReply("");
    await loadMessages();
  };

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <form onSubmit={login} className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-black text-white">B</div>
            <div><p className="font-black text-slate-950">BUYDATA</p><p className="text-xs text-slate-500">Private admin access</p></div>
          </div>
          <label className="mb-4 block text-sm font-semibold text-slate-700">Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-emerald-600" />
          </label>
          <label className="mb-4 block text-sm font-semibold text-slate-700">Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-emerald-600" />
          </label>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-lg bg-slate-950 py-3 font-bold text-white">Enter admin</button>
        </form>
      </main>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const value = (order.network || "").toUpperCase();
    const matchesNetwork = network === "AT" ? ["AT", "AT_PREMIUM", "AIRTELTIGO"].includes(value) : value === network;
    const hasPayment = Boolean(order.paystackReference) || ["PAID", "PROCESSING", "COMPLETED"].includes(order.status || "");
    return matchesNetwork && (section !== "payments" || hasPayment);
  });
  const selectedConversation = conversations.find((item) => item.id === conversationId);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
        <div><p className="text-lg font-black">BUYDATA Admin</p><p className="text-xs text-slate-500">Orders, payments and customer support</p></div>
        <div className="relative">
          <button type="button" aria-label="Open admin menu" onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-slate-200 p-2"><Menu size={22} /></button>
          {menuOpen && <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            {networks.map((item) => <button key={item} onClick={() => { setNetwork(item); chooseSection("orders"); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100">{item}</button>)}
            <button onClick={() => chooseSection("packages")} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100">Packages</button>
            <button onClick={() => chooseSection("support")} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100">Support</button>
            <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); setLoggedIn(false); }} className="mt-2 flex w-full items-center gap-2 border-t border-slate-100 px-3 py-3 text-left text-sm font-semibold text-red-600"><LogOut size={16} />Sign out</button>
          </div>}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <button onClick={() => chooseSection("orders")} className={`rounded-full px-4 py-2 text-sm font-bold ${section === "orders" ? "bg-slate-950 text-white" : "bg-white text-slate-600"}`}><Package className="mr-2 inline" size={16} />Orders</button>
          <button onClick={() => chooseSection("payments")} className={`rounded-full px-4 py-2 text-sm font-bold ${section === "payments" ? "bg-slate-950 text-white" : "bg-white text-slate-600"}`}>Payments</button>
          <button onClick={() => chooseSection("packages")} className={`rounded-full px-4 py-2 text-sm font-bold ${section === "packages" ? "bg-slate-950 text-white" : "bg-white text-slate-600"}`}>Packages</button>
          <button onClick={() => chooseSection("support")} className={`rounded-full px-4 py-2 text-sm font-bold ${section === "support" ? "bg-slate-950 text-white" : "bg-white text-slate-600"}`}><MessageCircle className="mr-2 inline" size={16} />Support</button>
        </div>

        {section === "packages" ? <section>
          <div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-black">Packages</h1><span className="rounded-full bg-white px-3 py-1 text-sm text-slate-500">{packages.length} packages</span></div>
          <form onSubmit={savePackage} className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
            <input value={packageForm.name} onChange={(event) => setPackageForm({ ...packageForm, name: event.target.value })} placeholder="Package name" required className="rounded-lg border px-3 py-2 text-sm lg:col-span-2" />
            <select value={packageForm.network} onChange={(event) => setPackageForm({ ...packageForm, network: event.target.value })} className="rounded-lg border px-3 py-2 text-sm"><option>MTN</option><option>TELECEL</option><option>AT</option></select>
            <input value={packageForm.capacity} onChange={(event) => setPackageForm({ ...packageForm, capacity: event.target.value })} placeholder="GB size" required className="rounded-lg border px-3 py-2 text-sm" />
            <input value={packageForm.basePrice} onChange={(event) => setPackageForm({ ...packageForm, basePrice: event.target.value })} placeholder="Price (GH₵)" type="number" min="0.01" step="0.01" required className="rounded-lg border px-3 py-2 text-sm" />
            <input value={packageForm.description} onChange={(event) => setPackageForm({ ...packageForm, description: event.target.value })} placeholder="Description" className="rounded-lg border px-3 py-2 text-sm lg:col-span-2" />
            <div className="flex gap-2 lg:col-span-4"><button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">{editingPackage ? "Save changes" : "Add package"}</button>{editingPackage && <button type="button" onClick={() => { setEditingPackage(null); setPackageForm({ name: "", network: "MTN", capacity: "", basePrice: "", description: "", isActive: true }); }} className="rounded-lg border px-4 py-2 text-sm font-bold">Cancel</button>}</div>
          </form>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Package</th><th className="px-4 py-3">Network</th><th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{packages.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="px-4 py-3 font-semibold">{item.name}<span className="block text-xs font-normal text-slate-500">{item.description}</span></td><td className="px-4 py-3">{item.network}</td><td className="px-4 py-3">{item.capacity}GB</td><td className="px-4 py-3 font-bold">GH₵ {Number(item.basePrice).toFixed(2)}</td><td className="px-4 py-3"><button onClick={() => startEditing(item)} className="mr-3 font-bold text-emerald-700">Edit</button><button onClick={() => deletePackage(item.id)} className="font-bold text-red-600">Delete</button></td></tr>)}</tbody></table></div>
        </section> : section !== "support" ? <section>
          <div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-black">{section === "payments" ? "Payments" : `${network} orders`}</h1><span className="rounded-full bg-white px-3 py-1 text-sm text-slate-500">{filteredOrders.length} records</span></div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Package</th><th className="px-4 py-3">Recipient</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Date</th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id} className="border-b border-slate-100"><td className="px-4 py-3 font-semibold">{order.productName || "Data package"}<span className="block text-xs text-slate-500">{order.network} {order.capacity}GB</span></td><td className="px-4 py-3">{order.customerPhone || "-"}</td><td className="px-4 py-3 font-bold">GH₵ {Number(order.amount || 0).toFixed(2)}</td><td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{order.status || "PENDING"}</span></td><td className="px-4 py-3 font-mono text-xs">{order.paystackReference || "Pending"}</td><td className="px-4 py-3 text-xs text-slate-500">{order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</td></tr>)}</tbody></table></div>
        </section> : <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-3"><h1 className="mb-3 font-black">Support chats</h1>{conversations.map((conversation) => <button key={conversation.id} onClick={() => setConversationId(conversation.id)} className={`mb-2 w-full rounded-lg p-3 text-left ${conversation.id === conversationId ? "bg-emerald-50" : "bg-slate-50"}`}><p className="font-bold">{conversation.latest.customerName || "Guest"}</p><p className="truncate text-xs text-slate-500">{conversation.latest.message}</p></button>)}</div>
          <div className="flex min-h-[520px] flex-col rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b p-4 font-bold">{selectedConversation?.latest.customerName || "Select a conversation"}{conversationId && <button onClick={() => setConversationId("")}><X size={18} /></button>}</div><div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">{selectedConversation?.items.map((message) => <div key={message.id} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.sender === "admin" ? "ml-auto bg-emerald-600 text-white" : "bg-white shadow-sm"}`}>{message.message}</div>)}</div>{conversationId && <form onSubmit={sendReply} className="flex gap-2 border-t p-3"><input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply to customer..." className="min-w-0 flex-1 rounded-lg border px-3 py-3" /><button className="rounded-lg bg-slate-950 px-4 font-bold text-white">Send</button></form>}</div>
        </section>}
      </div>
    </main>
  );
}
