"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  productId: string;
  productName: string;
  category: string;
  price: string;
  quantity: number;
  minimumStock: number;
};

type Transaction = {
  transactionId: string;
  transactionType: "RECEIVE" | "ISSUE";
  quantity: number;
  transactionDate: string;
  product: {
    productId: string;
    productName: string;
  };
  user: {
    userId: string;
    username: string;
  };
};

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, transactionsResponse] =
        await Promise.all([
          fetch("/api/products"),
          fetch("/api/stock-movement"),
        ]);

      if (!productsResponse.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลสินค้าได้");
      }

      if (!transactionsResponse.ok) {
        throw new Error(
          "ไม่สามารถโหลดประวัติการเคลื่อนไหวได้"
        );
      }

      const productsData = await productsResponse.json();
      const transactionsData =
        await transactionsResponse.json();

      setProducts(productsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("ไม่สามารถโหลด Dashboard ได้");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const lowStockProducts = products.filter(
    (product) =>
      product.quantity <= product.minimumStock
  );

  const receiveTransactions = transactions.filter(
    (transaction) =>
      transaction.transactionType === "RECEIVE"
  );

  const issueTransactions = transactions.filter(
    (transaction) =>
      transaction.transactionType === "ISSUE"
  );

  const latestReceive = receiveTransactions[0];
  const latestIssue = issueTransactions[0];

  const totalStock = products.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const recentTransactions = transactions.slice(0, 5);

  function formatDate(date: string) {
    return new Date(date).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={{ color: "#a3a3a3" }}>
            กำลังโหลด Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div>
            <h1 style={titleStyle}>
              Dashboard
            </h1>

            <p style={subtitleStyle}>
              ระบบจัดการสินค้าคงคลัง
            </p>
          </div>

          <button
            onClick={loadDashboard}
            style={refreshButtonStyle}
          >
            รีเฟรช
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        {/* Statistics */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <StatCard
            title="สินค้า"
            value={products.length}
            description="รายการสินค้าทั้งหมด"
          />

          <StatCard
            title="สินค้าใกล้หมด"
            value={lowStockProducts.length}
            description="quantity ≤ minimum stock"
            valueColor={
              lowStockProducts.length > 0
                ? "#f87171"
                : "#4ade80"
            }
          />

          <StatCard
            title="Stock รวม"
            value={totalStock}
            description="จำนวนสินค้าทั้งหมดในคลัง"
          />

          <StatCard
            title="รายการเคลื่อนไหว"
            value={transactions.length}
            description="รับเข้า + เบิกออก"
          />
        </section>

        {/* Latest Receive / Issue */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}
        >
          <LatestCard
            title="รับเข้าล่าสุด"
            transaction={latestReceive}
            type="RECEIVE"
          />

          <LatestCard
            title="เบิกล่าสุด"
            transaction={latestIssue}
            type="ISSUE"
          />
        </section>

        {/* Quick Menu */}
        <section style={{ marginTop: 32 }}>
          <h2 style={sectionTitleStyle}>
            เมนู
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            <MenuCard
              href="/products"
              title="จัดการสินค้า"
              description="เพิ่ม แก้ไข ลบ และดูข้อมูลสินค้า"
            />

            <MenuCard
              href="/receive"
              title="รับสินค้าเข้า"
              description="เพิ่มสินค้าเข้าสู่คลัง"
            />

            <MenuCard
              href="/issue"
              title="เบิกสินค้าออก"
              description="เบิกหรือจ่ายสินค้าออกจากคลัง"
            />

            <MenuCard
              href="/history"
              title="ประวัติ"
              description="ดูประวัติการเคลื่อนไหวสินค้า"
            />

            <MenuCard
              href="/low-stock"
              title="สินค้าใกล้หมด"
              description="ตรวจสอบสินค้าที่ต้องสั่งเพิ่ม"
            />
          </div>
        </section>

        {/* Low Stock */}
        <section style={{ marginTop: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2 style={sectionTitleStyle}>
              สินค้าใกล้หมด
            </h2>

            <Link
              href="/low-stock"
              style={linkStyle}
            >
              ดูทั้งหมด →
            </Link>
          </div>

          <section style={cardStyle}>
            {lowStockProducts.length === 0 ? (
              <p style={{ color: "#4ade80" }}>
                ไม่มีสินค้าใกล้หมด
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {lowStockProducts
                  .slice(0, 5)
                  .map((product) => (
                    <div
                      key={product.productId}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        padding: 14,
                        backgroundColor:
                          "#1f1f1f",
                        border:
                          "1px solid #333",
                        borderRadius: 8,
                      }}
                    >
                      <div>
                        <strong>
                          {product.productName}
                        </strong>

                        <div
                          style={{
                            marginTop: 4,
                            color: "#a3a3a3",
                            fontSize: 14,
                          }}
                        >
                          {product.productId}
                        </div>
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <div
                          style={{
                            color: "#f87171",
                            fontWeight: 700,
                          }}
                        >
                          Stock: {product.quantity}
                        </div>

                        <div
                          style={{
                            color: "#a3a3a3",
                            fontSize: 13,
                            marginTop: 4,
                          }}
                        >
                          ขั้นต่ำ:{" "}
                          {product.minimumStock}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </section>

        {/* Recent Transactions */}
        <section style={{ marginTop: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2 style={sectionTitleStyle}>
              รายการล่าสุด
            </h2>

            <Link
              href="/history"
              style={linkStyle}
            >
              ดูทั้งหมด →
            </Link>
          </div>

          <section style={cardStyle}>
            {recentTransactions.length === 0 ? (
              <p style={{ color: "#a3a3a3" }}>
                ยังไม่มีรายการเคลื่อนไหว
              </p>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={tableHeaderStyle}
                      >
                        วันที่
                      </th>

                      <th
                        style={tableHeaderStyle}
                      >
                        สินค้า
                      </th>

                      <th
                        style={tableHeaderStyle}
                      >
                        ประเภท
                      </th>

                      <th
                        style={tableHeaderStyle}
                      >
                        จำนวน
                      </th>

                      <th
                        style={tableHeaderStyle}
                      >
                        ผู้ทำรายการ
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentTransactions.map(
                      (transaction) => {
                        const isReceive =
                          transaction.transactionType ===
                          "RECEIVE";

                        return (
                          <tr
                            key={
                              transaction.transactionId
                            }
                          >
                            <td
                              style={tableCellStyle}
                            >
                              {formatDate(
                                transaction.transactionDate
                              )}
                            </td>

                            <td
                              style={tableCellStyle}
                            >
                              {
                                transaction.product
                                  .productName
                              }
                            </td>

                            <td
                              style={tableCellStyle}
                            >
                              <span
                                style={{
                                  display:
                                    "inline-block",
                                  padding:
                                    "5px 10px",
                                  borderRadius:
                                    999,
                                  backgroundColor:
                                    isReceive
                                      ? "#14532d"
                                      : "#7f1d1d",
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                {isReceive
                                  ? "รับเข้า"
                                  : "เบิกออก"}
                              </span>
                            </td>

                            <td
                              style={{
                                ...tableCellStyle,
                                color:
                                  isReceive
                                    ? "#4ade80"
                                    : "#f87171",
                                fontWeight: 700,
                              }}
                            >
                              {isReceive
                                ? "+"
                                : "-"}
                              {
                                transaction.quantity
                              }
                            </td>

                            <td
                              style={
                                tableCellStyle
                              }
                            >
                              {
                                transaction.user
                                  .username
                              }
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

/* =========================
   Components
========================= */

function StatCard({
  title,
  value,
  description,
  valueColor = "#ffffff",
}: {
  title: string;
  value: number;
  description: string;
  valueColor?: string;
}) {
  return (
    <div style={cardStyle}>
      <p style={cardLabelStyle}>
        {title}
      </p>

      <strong
        style={{
          display: "block",
          marginTop: 8,
          fontSize: 34,
          color: valueColor,
        }}
      >
        {value}
      </strong>

      <p
        style={{
          marginTop: 6,
          marginBottom: 0,
          color: "#737373",
          fontSize: 13,
        }}
      >
        {description}
      </p>
    </div>
  );
}

function LatestCard({
  title,
  transaction,
  type,
}: {
  title: string;
  transaction?: Transaction;
  type: "RECEIVE" | "ISSUE";
}) {
  const isReceive = type === "RECEIVE";

  return (
    <div style={cardStyle}>
      <p style={cardLabelStyle}>
        {title}
      </p>

      {!transaction ? (
        <p style={{ color: "#737373" }}>
          ยังไม่มีรายการ
        </p>
      ) : (
        <>
          <h3
            style={{
              marginTop: 10,
              marginBottom: 4,
              fontSize: 20,
            }}
          >
            {transaction.product.productName}
          </h3>

          <p
            style={{
              color: "#a3a3a3",
              margin: 0,
            }}
          >
            {transaction.product.productId}
          </p>

          <strong
            style={{
              display: "block",
              marginTop: 12,
              color: isReceive
                ? "#4ade80"
                : "#f87171",
              fontSize: 28,
            }}
          >
            {isReceive ? "+" : "-"}
            {transaction.quantity}
          </strong>

          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              color: "#737373",
              fontSize: 13,
            }}
          >
            {formatDateStatic(
              transaction.transactionDate
            )}
          </p>
        </>
      )}
    </div>
  );
}

function MenuCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          ...cardStyle,
          minHeight: 110,
          transition: "0.2s",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 18,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            marginTop: 8,
            marginBottom: 0,
            color: "#a3a3a3",
            lineHeight: 1.5,
            fontSize: 14,
          }}
        >
          {description}
        </p>
      </div>
    </Link>
  );
}

function formatDateStatic(date: string) {
  return new Date(date).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* =========================
   Styles
========================= */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#0f0f0f",
  color: "#ffffff",
  padding: "40px 20px",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 32,
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 8,
  marginBottom: 0,
  color: "#a3a3a3",
};

const refreshButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
};

const errorStyle: React.CSSProperties = {
  marginBottom: 20,
  padding: "12px 16px",
  backgroundColor: "#451a1a",
  border: "1px solid #7f1d1d",
  borderRadius: 8,
  color: "#fca5a5",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#171717",
  border: "1px solid #333",
  borderRadius: 12,
  padding: 20,
};

const cardLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "#a3a3a3",
  fontSize: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
};

const linkStyle: React.CSSProperties = {
  color: "#60a5fa",
  textDecoration: "none",
  fontSize: 14,
};

const tableHeaderStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: "1px solid #333",
  color: "#a3a3a3",
  fontSize: 13,
};

const tableCellStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid #292929",
  color: "#ffffff",
};