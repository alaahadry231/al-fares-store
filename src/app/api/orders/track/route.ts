import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderRef = searchParams.get("order_ref");
    const playerId = searchParams.get("player_id");

    if (!orderRef || !playerId) {
      return NextResponse.json({ error: "رقم الطلب والآيدي مطلوبين" }, { status: 400 });
    }

    const result = await sql`
      select * from orders 
      where order_ref = ${orderRef} and player_id = ${playerId}
      limit 1
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "لم يتم العثور على الطلب. تأكد من رقم الطلب والآيدي." }, { status: 404 });
    }

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}