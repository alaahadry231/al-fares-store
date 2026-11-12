"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 👇 مقارنة بسيطة مع كلمة السر
    if (password === "364621463AlFares") { 
      localStorage.setItem("admin_logged_in", "true");
      router.push("/admin/orders");
    } else {
      setError("كلمة السر غير صحيحة");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={32} className="text-sky-400" />
        </div>
        <h1 className="text-2xl font-bold mb-6">لوحة الإدارة</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة السر"
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-center focus:border-sky-500 outline-none transition"
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sky-500 text-slate-900 font-bold hover:bg-sky-400 transition"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}