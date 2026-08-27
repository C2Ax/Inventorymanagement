import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany();

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        productId: body.productId,
        productName: body.productName,
        category: body.category,
        price: body.price,
        quantity: body.quantity ?? 0,
        minimumStock: body.minimumStock ?? 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มสินค้าได้" },
      { status: 500 }
    );
  }
}