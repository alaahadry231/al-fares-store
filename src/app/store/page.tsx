"use client";

import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, ShoppingBag, Search, X, CheckCircle, Zap, ShieldCheck, Headphones, Truck } from "lucide-react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  category: string;
  product_type: string;
  qty_values: { min: number; max: number } | null;
  params: string[];
  image: string | null;
  price: string;
};

type Category = {
  name: string;
  products: Product[];
};

export default function StorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [shamTxId, setShamTxId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/test-homscard");
        const json = await res.json();
        
        if (json.categories) {
          setCategories(json.categories);
          if (json.categories.length > 0) {
            setActiveCategory(json.categories[0].name);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openOrderModal = (product: Product) => {
    setSelectedProduct(product);
    setPlayerId("");
    setShamTxId("");
    if (product.product_type === "quantity" && product.qty_values) {
      setQuantity(product.qty_values.min);
    } else {
      setQuantity(1);
    }
    setOrderSuccess(null);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    let basePrice = parseFloat(selectedProduct.price);
    if (selectedProduct.product_type === "quantity") {
      basePrice = basePrice * quantity;
    }
    const finalAmount = basePrice * 1.02;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          player_id: playerId,
          amount: finalAmount.toFixed(2),
          sham_transaction_id: shamTxId,
          quantity: quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "فشل إنشاء الطلب");
        return;
      }

      setOrderSuccess(data.data);
    } catch {
      alert("تعذر الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setPlayerId("");
    setShamTxId("");
    setOrderSuccess(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const currentCategory = categories.find((c) => c.name === activeCategory);
  const filteredProducts = currentCategory?.products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20 flex flex-col">
      {/* 👇 الهيدر */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 p-3 md:p-4">
        <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 relative">
          {/* الشعار + زر التتبع */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/store" className="flex items-center gap-2">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.5)]">
                <ShoppingBag size={20} className="text-white md:w-6 md:h-6" />
              </div>
              <span className="text-lg md:text-xl font-bold">Al Fares <span className="text-sky-400">Store</span></span>
            </Link>
            
            {/* زر التتبع للموبايل (بيظهر بس على الموبايل) */}
            <Link 
              href="/track" 
              className="md:hidden px-4 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-xs"
            >
              تتبع الطلب
            </Link>
          </div>

          {/* زر التتبع للكمبيوتر (في النص) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <Link 
              href="/track" 
              className="px-6 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold hover:bg-sky-500/20 transition-all text-sm"
            >
              تتبع الطلب
            </Link>
          </div>

          {/* البحث */}
          <div className="relative w-full md:w-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl py-2 pr-9 pl-3 text-sm focus:border-sky-500 outline-none w-full md:w-64 transition"
            />
          </div>
        </div>
      </header>

      {/* 👇 شريط التواصل */}
      <div className="bg-slate-900/50 border-b border-white/5 py-2 md:py-3">
        <div className="container mx-auto px-3 md:px-4 flex flex-wrap justify-center items-center gap-2 md:gap-4">
          <a
            href="https://wa.me/963986851407"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition font-bold text-[10px] md:text-sm"
          >
            <FaWhatsapp size={14} className="md:w-4 md:h-4" />
            واتساب
          </a>
          <a
            href="https://t.me/AlFares_Story"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition font-bold text-[10px] md:text-sm"
          >
            <FaTelegram size={14} className="md:w-4 md:h-4" />
            حساب تلغرام
          </a>
          <a
            href="https://t.me/AlFaresStory"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition font-bold text-[10px] md:text-sm"
          >
            <FaTelegram size={14} className="md:w-4 md:h-4" />
            قناة تلغرام
          </a>
        </div>
      </div>

      {/* 👇 Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/20 to-slate-950 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
            alt="Gaming Background" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 drop-shadow-lg">
              اشحن <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">ألعابك</span> بأسرع وقت
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
              أفضل الأسعار، شحن فوري، وأمان تام. اختر لعبتك المفضلة وابدأ اللعب الآن.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#products" className="px-8 py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-lg transition-all shadow-[0_0_30px_rgba(14,165,233,0.4)]">
                تسوق الآن
              </a>
              <Link href="/track" className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg transition-all backdrop-blur-sm">
                تتبع طلبك
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 👇 شريط المميزات */}
      <section className="py-8 bg-slate-900/50 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "شحن فوري", desc: "خلال دقائق" },
              { icon: ShieldCheck, title: "أمان تام", desc: "حماية بياناتك" },
              { icon: Headphones, title: "دعم 24/7", desc: "نحن هنا دائماً" },
              { icon: Truck, title: "أسعار منافسة", desc: "أفضل الأسعار" },
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                  <feature.icon size={20} className="text-sky-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{feature.title}</h4>
                  <p className="text-xs text-slate-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <main id="products" className="container mx-auto px-4 pt-12 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold font-heading mb-2">اختر <span className="text-sky-400">فئتك</span></h2>
          <p className="text-slate-400">تصفح المنتجات حسب الفئة</p>
        </motion.div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide justify-center flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategory(cat.name);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.name
                  ? "bg-sky-500 text-slate-900 shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                  : "bg-slate-900 text-slate-300 border border-white/5 hover:bg-slate-800"
              }`}
            >
              <Gamepad2 size={18} />
              {cat.name}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeCategory === cat.name ? "bg-slate-900/20" : "bg-slate-800"
              }`}>
                {cat.products.length}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500">
              لا توجد منتجات تطابق بحثك
            </div>
          ) : (
            filteredProducts.map((product, idx) => {
              const displayPrice = (parseFloat(product.price) * 1.02).toFixed(2);
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-sky-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] cursor-pointer flex flex-col"
                  onClick={() => openOrderModal(product)}
                >
                  <div className="aspect-square bg-slate-950/50 relative overflow-hidden flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-0"
                      />
                    ) : (
                      <Gamepad2 size={64} className="text-slate-700" />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-sm md:text-base mb-3 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sky-400 font-bold text-lg">
                        ${displayPrice}
                      </span>
                      <button className="bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-900 text-xs font-bold py-2 px-4 rounded-lg transition-colors border border-sky-500/20">
                        شراء
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(14,165,233,0.2)]"
            >
              {/* 👇 صورة خلفية حقيقية (ملعب/ألعاب) */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />

              {orderSuccess ? (
                <div className="relative z-10 p-8 text-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                    <CheckCircle size={40} className="text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">تم استلام طلبك!</h2>
                  <p className="text-slate-400 mb-6 text-sm">
                    يرجى الاحتفاظ برقم الطلب لمتابعة حالته.
                  </p>
                  <div className="bg-black/50 rounded-xl p-4 mb-6 border border-white/5">
                    <div className="text-sm text-slate-400 mb-1">رقم الطلب:</div>
                    <div className="text-2xl font-bold text-sky-400 font-mono">{orderSuccess.order_ref}</div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-full py-3 rounded-xl bg-sky-500 text-slate-900 font-bold hover:bg-sky-400 transition shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                  >
                    إغلاق
                  </button>
                </div>
              ) : (
                <div className="relative z-10">
                  {/* الهيدر */}
                  <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
                    <h3 className="font-bold text-xl text-white drop-shadow-md">إتمام الطلب</h3>
                    <button onClick={closeModal} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-full transition hover:bg-white/10">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateOrder} className="p-6 space-y-6">
                    
                    {/* معلومات المنتج */}
                    <div className="flex items-center gap-5 bg-slate-950/60 p-4 rounded-2xl border border-white/5 shadow-lg">
                      <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-inner">
                        {selectedProduct.image && (
                          <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain p-2" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-white mb-1">{selectedProduct.name}</h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sky-400 font-bold text-2xl drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]">
                            ${selectedProduct.product_type === "quantity"
                              ? (parseFloat(selectedProduct.price) * quantity * 1.02).toFixed(2)
                              : (parseFloat(selectedProduct.price) * 1.02).toFixed(2)}
                          </span>
                          <span className="text-slate-500 text-xs">الإجمالي</span>
                        </div>
                      </div>
                    </div>

                    {/* حقول الإدخال */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">الآيدي (Player ID) *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Gamepad2 size={18} className="text-slate-500" />
                          </div>
                          <input
                            type="text"
                            value={playerId}
                            onChange={(e) => setPlayerId(e.target.value)}
                            placeholder="أدخل الآيدي الخاص بك"
                            className="w-full bg-slate-950/70 border border-white/10 rounded-2xl pr-10 pl-4 py-4 text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                            required
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {selectedProduct.product_type === "quantity" && selectedProduct.qty_values && (
                        <div>
                          <label className="block text-sm font-bold text-slate-300 mb-2">
                            الكمية <span className="text-slate-500 font-normal">(الحد الأدنى: {selectedProduct.qty_values.min})</span>
                          </label>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || selectedProduct.qty_values!.min)}
                            min={selectedProduct.qty_values.min}
                            max={selectedProduct.qty_values.max}
                            className="w-full bg-slate-950/70 border border-white/10 rounded-2xl px-4 py-4 text-white font-mono focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all shadow-inner"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* تعليمات الدفع */}
                    <div className="bg-gradient-to-br from-sky-500/10 to-blue-600/5 border border-sky-500/20 rounded-2xl p-5 relative overflow-hidden shadow-[inset_0_0_20px_rgba(14,165,233,0.1)]">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-500"></div>
                      <p className="text-sm text-sky-200 mb-3 font-bold flex items-center gap-2">
                        <ShieldCheck size={18} /> تعليمات الدفع
                      </p>
                      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                        يرجى تحويل مبلغ <strong className="text-white text-base">${selectedProduct.product_type === "quantity" 
                          ? (parseFloat(selectedProduct.price) * quantity * 1.02).toFixed(2)
                          : (parseFloat(selectedProduct.price) * 1.02).toFixed(2)}</strong> إلى محفظة شام كاش التالية:
                      </p>
                      <div className="bg-slate-950/80 rounded-xl p-3 font-mono text-sm text-sky-400 break-all select-all border border-sky-500/20 text-center shadow-inner">
                        47e43434d3f4781942c1464a7f64e84a
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">رقم عملية شام كاش *</label>
                      <input
                        type="text"
                        value={shamTxId}
                        onChange={(e) => setShamTxId(e.target.value)}
                        placeholder="أدخل رقم العملية بعد التحويل"
                        className="w-full bg-slate-950/70 border border-white/10 rounded-2xl px-4 py-4 text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-lg hover:from-sky-400 hover:to-blue-500 transition-all disabled:opacity-50 mt-2 shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_40px_rgba(14,165,233,0.6)]"
                    >
                      {isSubmitting ? "جاري الإرسال..." : "تأكيد الطلب"}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}