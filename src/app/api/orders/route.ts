import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, product_name, player_id, amount, sham_transaction_id, quantity } = body;

    if (!product_id || !product_name || !player_id || !amount) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    // 1. نحفظ الطلب في الداتابيس
    const orderRef = `AF-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    const result = await sql`
      insert into orders (
        order_ref, product_id, product_name, player_id, amount, sham_transaction_id, quantity, status
      )
      values (
        ${orderRef}, ${product_id}, ${product_name}, ${player_id}, ${amount}, ${sham_transaction_id || ""}, ${quantity || 1}, 'pending_verification'
      )
      returning *
    `;

    const order = result[0];

    // 2. نبعت إشعار لتلغرام
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const message = `
🛒 *طلب جديد!*
━━━━━━━━━━━━━━
📦 *المنتج:* ${order.product_name}
🆔 *الطلب:* \`${order.order_ref}\`
🎮 *الآيدي:* \`${order.player_id}\`
🔢 *الكمية:* ${order.quantity}
💰 *المبلغ:* $${order.amount}
🔢 *رقم عملية شام كاش:* \`${order.sham_transaction_id}\`
━━━━━━━━━━━━━━
⏳ بانتظار التحقق من الدفع.
      `;

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

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "فشل حفظ الطلب" }, { status: 500 });
  }
}