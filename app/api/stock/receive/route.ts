import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { productId, quantity, userId } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "กรุณาระบุ userId" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. ตรวจสอบสินค้า
      const product = await tx.product.findUnique({
        where: {
          productId,
        },
      });

      if (!product) {
        throw new Error("ไม่พบสินค้า");
      }

      // 2. เพิ่ม Stock
      const updatedProduct = await tx.product.update({
        where: {
          productId,
        },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });

      // 3. บันทึกประวัติการรับสินค้า
      const transaction = await tx.stockTransaction.create({
        data: {
          transactionType: "RECEIVE",
          quantity,
          productId,
          userId,
        },
      });

      return {
        product: updatedProduct,
        transaction,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ไม่สามารถรับสินค้าเข้าได้",
      },
      { status: 500 }
    );
  }
}