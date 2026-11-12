import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, status, cancel_reason } = body;

    if (!order_id || !status) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    // 1. نحدث الطلب في الداتابيس
    let updatedOrder;
    if (status === "cancelled") {
      const result = await sql`
        update orders 
        set status = ${status}, cancel_reason = ${cancel_reason || ""}, updated_at = now()
        where id = ${order_id}
        returning *
      `;
      updatedOrder = result[0];
    } else {
      const result = await sql`
        update orders 
        set status = ${status}, updated_at = now()
        where id = ${order_id}
        returning *
      `;
      updatedOrder = result[0];
    }

    // 2. نبعت إشعار لتلغرام
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId && updatedOrder) {
      const statusLabels: { [key: string]: string } = {
        shipped: "✅ تم الشحن",
        cancelled: "❌ ملغي",
        pending_verification: "⏳ بانتظار التحقق",
      };

      const statusLabel = statusLabels[status] || status;
      
      let message = `
🔄 *تحديث حالة الطلب*
━━━━━━━━━━━━━━
🆔 *الطلب:* \`${updatedOrder.order_ref}\`
📦 *المنتج:* ${updatedOrder.product_name}
🎮 *الآيدي:* \`${updatedOrder.player_id}\`
🔢 *الكمية:* ${updatedOrder.quantity}
💰 *المبلغ:* $${updatedOrder.amount}
📌 *الحالة الجديدة:* ${statusLabel}
      `;

      // 👇 إذا كان ملغي، نضيف السبب
      if (status === "cancelled" && cancel_reason) {
        message += `\n📝 *سبب الإلغاء:* ${cancel_reason}`;
      }

      message += `\n━━━━━━━━━━━━━━`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}