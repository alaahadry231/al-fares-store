"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, CheckCircle, Clock, XCircle, X } from "lucide-react";

type Order = {
  id: number;
  order_ref: string;
  product_name: string;
  player_id: string;
  quantity: number;
  amount: number;
  sham_transaction_id: string;
  status: string;
  cancel_reason: string;
  created_at: string;
};

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "shipped" | "cancelled">("pending");

  // 👇 حالات نافذة الإلغاء
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      setOrders(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      router.push("/admin/login");
      return;
    }
    fetchOrders();
  }, [router]);

  const handleShip = async (orderId: number) => {
    if (!confirm("هل أنت متأكد من تأكيد الشحن؟")) return;
    try {
      const res = await fetch("/api/admin/orders/ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status: "shipped" }),
      });
      if (!res.ok) { alert("فشل التحديث"); return; }
      await fetchOrders();
    } catch { alert("تعذر الاتصال بالخادم"); }
  };

  const openCancelModal = (order: Order) => {
    setCancellingOrder(order);
    setCancelReason("");
    setIsCancelling(false);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    if (!cancelReason.trim()) {
      alert("الرجاء كتابة سبب الإلغاء");
      return;
    }

    setIsCancelling(true);
    try {
      const res = await fetch("/api/admin/orders/ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order_id: cancellingOrder.id, 
          status: "cancelled",
          cancel_reason: cancelReason.trim()
        }),
      });
      if (!res.ok) { alert("فشل التحديث"); return; }
      
      setCancellingOrder(null);
      await fetchOrders();
    } catch { alert("تعذر الاتصال بالخادم"); }
    finally { setIsCancelling(false); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shipped":
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20"><CheckCircle size={14} /> تم الشحن</span>;
      case "cancelled":
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20"><XCircle size={14} /> ملغي</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20"><Clock size={14} /> بانتظار التحقق</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-GB", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return dateStr; }
  };

  if (loading) return <div className="text-slate-500 text-center py-20">جاري التحميل...</div>;

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "pending") return o.status === "pending_verification";
    if (activeTab === "shipped") return o.status === "shipped";
    if (activeTab === "cancelled") return o.status === "cancelled";
    return true;
  });

  const counts = {
    pending: orders.filter(o => o.status === "pending_verification").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold font-heading">إدارة الطلبات</h1>
        <p className="text-slate-400 text-sm mt-1">مراجعة وتأكيد طلبات الشحن</p>
      </motion.div>

      {/* التبويبات */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab("pending")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === "pending" ? "bg-yellow-500 text-slate-900 shadow-[0_0_20px_rgba(234,179,8,0.4)]" : "bg-slate-900 text-slate-300 border border-white/5 hover:bg-slate-800"}`}>
          <Clock size={18} /> قيد الانتظار ({counts.pending})
        </button>
        <button onClick={() => setActiveTab("shipped")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === "shipped" ? "bg-green-500 text-slate-900 shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "bg-slate-900 text-slate-300 border border-white/5 hover:bg-slate-800"}`}>
          <CheckCircle size={18} /> تمت ({counts.shipped})
        </button>
        <button onClick={() => setActiveTab("cancelled")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === "cancelled" ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-slate-900 text-slate-300 border border-white/5 hover:bg-slate-800"}`}>
          <XCircle size={18} /> ملغية ({counts.cancelled})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <Package size={64} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">لا توجد طلبات في هذا القسم</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-1 rounded">{order.order_ref}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <h3 className="text-lg font-bold">{order.product_name}</h3>
                  <p className="text-slate-400 text-sm mt-1">الآيدي: <span className="text-white font-mono">{order.player_id}</span></p>
                  <p className="text-slate-400 text-sm">الكمية: <span className="text-white font-bold">{order.quantity}</span></p>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-yellow-400">${order.amount}</div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-4 border border-white/5 mb-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">رقم عملية شام كاش</div>
                  <div className="font-mono text-white">{order.sham_transaction_id || "لم يتم الإدخال"}</div>
                </div>
                <div className="text-xs text-slate-500">{formatDate(order.created_at)}</div>
              </div>

              {/* 👇 عرض سبب الإلغاء إذا موجود */}
              {order.status === "cancelled" && order.cancel_reason && (
                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 mb-4">
                  <div className="text-xs text-red-400 mb-1 font-bold">سبب الإلغاء:</div>
                  <div className="text-sm text-white">{order.cancel_reason}</div>
                </div>
              )}

              {/* أزرار التحكم */}
              <div className="flex gap-2 flex-wrap">
                {order.status === "pending_verification" && (
                  <>
                    <button onClick={() => handleShip(order.id)} className="flex-1 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 font-bold transition">
                      تأكيد الشحن
                    </button>
                    <button onClick={() => openCancelModal(order)} className="px-6 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold transition">
                      إلغاء
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 👇 نافذة سبب الإلغاء */}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCancellingOrder(null)}>
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
              <h3 className="font-bold text-lg text-red-400">إلغاء الطلب</h3>
              <button onClick={() => setCancellingOrder(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCancelSubmit} className="p-6 space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-2">
                <p className="text-sm text-red-400">سيتم إلغاء الطلب <strong className="text-white">{cancellingOrder.order_ref}</strong> وإبلاغ المستخدم بالسبب.</p>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">سبب الإلغاء *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="مثلاً: رقم عملية شام كاش غير صحيح، أو الدفع لم يصل..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition min-h-[100px] resize-none"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={isCancelling} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition disabled:opacity-50">
                  {isCancelling ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
                </button>
                <button type="button" onClick={() => setCancellingOrder(null)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition">
                  رجوع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}