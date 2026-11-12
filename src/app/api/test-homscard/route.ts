import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://homscard.com/reseller/products.php?available=1", {
      headers: {
        "api-token": process.env.HOMSCARD_API_TOKEN!,
      },
    });

    const data = await res.json();

    if (data.status !== "OK" || !data.data) {
      return NextResponse.json({ error: "فشل جلب المنتجات" }, { status: 500 });
    }

    const categoriesMap: { [key: string]: any[] } = {};

    data.data.forEach((product: any) => {
      if (!product.available) return;

      // 👇 نرجع البيانات زي ما هي من Homscard (بدون أي تعديل)
      const formattedProduct = {
        id: product.id,
        name: product.name,
        category: product.category || "أخرى",
        product_type: product.product_type,
        qty_values: product.qty_values,
        params: product.params || [],
        image: product.image || null,
        price: product.price, // 👈 السعر الأصلي زي ما هو (نص أو رقم)
      };

      const cat = formattedProduct.category;
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = [];
      }
      categoriesMap[cat].push(formattedProduct);
    });

    const categories = Object.keys(categoriesMap).map((catName) => ({
      name: catName,
      products: categoriesMap[catName],
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل الاتصال" }, { status: 500 });
  }
}