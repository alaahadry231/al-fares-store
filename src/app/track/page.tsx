"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";

type Order = {
  id: number;
  order_ref: string;
  product_name: string;
  player_id: string;
  quantity: number;
  amount: number;
  status: string;
  cancel_reason: string;
  created_at: string;
  sham_transaction_id: string;
};

export default function TrackOrderPage() {
  const [orderRef, setOrderRef] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?order_ref=${encodeURIComponent(orderRef.trim())}&player_id=${encodeURIComponent(playerId.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "لم يتم العثور على الطلب");
        return;
      }

      setOrder(data.data);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "shipped":
        return { label: "تم الشحن", icon: <CheckCircle size={20} />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" };
      case "cancelled":
        return { label: "ملغي", icon: <XCircle size={20} />, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
      default:
        return { label: "بانتظار التحقق", icon: <Clock size={20} />, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-GB", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return dateStr; }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold">Al Fares <span className="text-sky-400">Store</span></span>
          </Link>
          <Link href="/store" className="text-sm text-slate-400 hover:text-white transition">العودة للمتجر</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-bold font-heading mb-2">تتبع <span className="text-sky-400">الطلب</span></h1>
          <p className="text-slate-400">أدخل رقم الطلب والآيدي لمشاهدة حالة طلبك</p>
        </motion.div>

        <form onSubmit={handleTrack} className="glass-panel rounded-3xl p-6 md:p-8 mb-8 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">رقم الطلب *</label>
            <input type="text" value={orderRef} onChange={(e) => setOrderRef(e.target.value)} placeholder="AF-123456" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-sky-500 outline-none transition" required dir="ltr" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">الآيدي (Player ID) *</label>
            <input type="text" value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder="أدخل الآيدي الخاص بك" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-sky-500 outline-none transition" required dir="ltr" />
          </div>
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold hover:from-sky-400 hover:to-blue-500 transition-all disabled:opacity-50">
            <Search size={20} /> {loading ? "جاري البحث..." : "تتبع الطلب"}
          </button>
        </form>

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${getStatusConfig(order.status).bg} ${getStatusConfig(order.status).color} ${getStatusConfig(order.status).border}`}>
                {getStatusConfig(order.status).icon} {getStatusConfig(order.status).label}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-400">رقم الطلب</span>
                <span className="font-mono font-bold text-sky-400">{order.order_ref}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-400">المنتج</span>
                <span className="font-bold">{order.product_name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-400">الآيدي</span>
                <span className="font-mono">{order.player_id}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-400">الكمية</span>
                <span className="font-bold">{order.quantity}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-slate-400">المبلغ</span>
                <span className="font-bold text-yellow-400">${order.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">تاريخ الطلب</span>
                <span className="text-sm">{formatDate(order.created_at)}</span>
              </div>
            </div>

            {/* 👇 عرض سبب الإلغاء إذا الطلب ملغي */}
            {order.status === "cancelled" && order.cancel_reason && (
              <div className="mt-6 bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                <div className="text-sm text-red-400 mb-1 font-bold">سبب الإلغاء:</div>
                <div className="text-sm text-white">{order.cancel_reason}</div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}