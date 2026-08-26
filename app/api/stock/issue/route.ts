import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { productId, quantity, userId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "กรุณาระบุสินค้า" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "จำนวนสินค้าต้องมากกว่า 0" },
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
      // ค้นหาสินค้า
      const product = await tx.product.findUnique({
        where: {
          productId,
        },
      });

      if (!product) {
        throw new Error("ไม่พบสินค้า");
      }

      // Business Rule:
      // ห้ามจ่ายสินค้าเกินจำนวนที่มี
      if (product.quantity < quantity) {
        throw new Error(
          `สินค้าไม่เพียงพอ มีอยู่ ${product.quantity} ชิ้น`
        );
      }

      // ลด Stock
      const updatedProduct = await tx.product.update({
        where: {
          productId,
        },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });

      // บันทึกประวัติ
      const transaction = await tx.stockTransaction.create({
        data: {
          transactionType: "ISSUE",
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

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ไม่สามารถเบิกสินค้าออกได้",
      },
      { status: 500 }
    );
  }
}