import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ productsId: string }> }
) {
  try {
    const { productsId } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: {
        productId: productsId,
      },
      data: {
        productName: body.productName,
        category: body.category,
        price: body.price,
        quantity: body.quantity,
        minimumStock: body.minimumStock,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขสินค้าได้" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productsId: string }> }
) {
  try {
    const { productsId } = await params;

    const product = await prisma.product.delete({
      where: {
        productId: productsId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "ไม่สามารถลบสินค้าได้" },
      { status: 500 }
    );
  }
}