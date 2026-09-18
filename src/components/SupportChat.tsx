"use client";

import { FormEvent, useEffect, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type Message = { id: string; sender: string; message: string };

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    const storedId = window.localStorage.getItem("buydata_support_conversation");
    if (storedId) setConversationId(storedId);
  }, []);

  useEffect(() => {
    if (!open || !conversationId) return;
    fetch(`/api/support?conversationId=${encodeURIComponent(conversationId)}`).then((response) => response.json()).then((data) => setMessages(data.messages || []));
  }, [open, conversationId]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    const response = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, customerName, message }) });
    const data = await response.json();
    if (!response.ok) return;
    setConversationId(data.conversationId);
    window.localStorage.setItem("buydata_support_conversation", data.conversationId);
    setMessages((current) => [...current, data.message]);
    setMessage("");
  };

  return <><button type="button" aria-label="Open support chat" onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl"><MessageCircle size={25} /></button>{open && <div className="fixed bottom-5 right-5 z-40 flex h-[min(580px,calc(100dvh-2rem))] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center justify-between bg-emerald-600 p-4 text-white"><div><p className="font-black">BUYDATA Support</p><p className="text-xs text-emerald-100">Send us a message</p></div><button type="button" aria-label="Close support chat" onClick={() => setOpen(false)}><X size={20} /></button></div><div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">{messages.length === 0 && <p className="rounded-xl bg-white p-3 text-sm text-slate-500">Hi. How can we help?</p>}{messages.map((item) => <div key={item.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${item.sender === "customer" ? "ml-auto bg-emerald-600 text-white" : "bg-white text-slate-700 shadow-sm"}`}>{item.message}</div>)}</div><form onSubmit={sendMessage} className="space-y-2 border-t p-3">{!conversationId && <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Your name (optional)" className="w-full rounded-lg border px-3 py-2 text-sm" />}<div className="flex gap-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a message..." className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" /><button aria-label="Send message" className="rounded-lg bg-slate-950 px-3 text-white"><Send size={17} /></button></div></form></div>}</>;
}
