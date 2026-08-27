import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const transactions = await prisma.stockTransaction.findMany({
      orderBy: {
        transactionDate: "desc",
      },
      include: {
        product: {
          select: {
            productId: true,
            productName: true,
          },
        },
        user: {
          select: {
            userId: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "ไม่สามารถโหลดประวัติการเคลื่อนไหวสินค้าได้",
      },
      { status: 500 }
    );
  }
}