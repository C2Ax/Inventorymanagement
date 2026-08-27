"use client";

import { useEffect, useState } from "react";

type Transaction = {
  transactionId: string;
  transactionType: "RECEIVE" | "ISSUE";
  quantity: number;
  transactionDate: string;
  productId: string;
  userId: string;
  product: {
    productId: string;
    productName: string;
  };
  user: {
    userId: string;
    username: string;
  };
};

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadHistory() {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/stock-movement");

      if (!response.ok) {
        throw new Error(
          "ไม่สามารถโหลดประวัติการเคลื่อนไหวสินค้าได้"
        );
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "ไม่สามารถโหลดประวัติการเคลื่อนไหวสินค้าได้"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

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
          <p>กำลังโหลดประวัติ...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>
              ประวัติการเคลื่อนไหวสินค้า
            </h1>

            <p style={subtitleStyle}>
              ประวัติการรับเข้าและเบิกสินค้าออกจากคลัง
            </p>
          </div>

          <button
            onClick={loadHistory}
            style={refreshButtonStyle}
          >
            รีเฟรช
          </button>
        </div>

        {/* Error / Message */}
        {message && (
          <div style={messageStyle}>
            {message}
          </div>
        )}

        {/* Summary */}
        <div style={summaryStyle}>
          <div style={summaryCardStyle}>
            <span style={summaryLabelStyle}>
              รายการทั้งหมด
            </span>

            <strong style={summaryValueStyle}>
              {transactions.length}
            </strong>
          </div>

          <div style={summaryCardStyle}>
            <span style={summaryLabelStyle}>
              รับเข้า
            </span>

            <strong
              style={{
                ...summaryValueStyle,
                color: "#4ade80",
              }}
            >
              {
                transactions.filter(
                  (item) =>
                    item.transactionType === "RECEIVE"
                ).length
              }
            </strong>
          </div>

          <div style={summaryCardStyle}>
            <span style={summaryLabelStyle}>
              เบิกออก
            </span>

            <strong
              style={{
                ...summaryValueStyle,
                color: "#f87171",
              }}
            >
              {
                transactions.filter(
                  (item) =>
                    item.transactionType === "ISSUE"
                ).length
              }
            </strong>
          </div>
        </div>

        {/* Table */}
        <section style={tableCardStyle}>
          {transactions.length === 0 ? (
            <div style={emptyStyle}>
              ยังไม่มีประวัติการเคลื่อนไหวสินค้า
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={cellHeaderStyle}>
                      วันที่
                    </th>

                    <th style={cellHeaderStyle}>
                      รหัสสินค้า
                    </th>

                    <th style={cellHeaderStyle}>
                      สินค้า
                    </th>

                    <th style={cellHeaderStyle}>
                      ประเภท
                    </th>

                    <th style={cellHeaderStyle}>
                      จำนวน
                    </th>

                    <th style={cellHeaderStyle}>
                      ผู้ทำรายการ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => {
                    const isReceive =
                      transaction.transactionType ===
                      "RECEIVE";

                    return (
                      <tr
                        key={transaction.transactionId}
                      >
                        <td style={cellStyle}>
                          {formatDate(
                            transaction.transactionDate
                          )}
                        </td>

                        <td style={cellStyle}>
                          {transaction.product.productId}
                        </td>

                        <td style={cellStyle}>
                          {transaction.product.productName}
                        </td>

                        <td style={cellStyle}>
                          <span
                            style={{
                              ...badgeStyle,
                              backgroundColor: isReceive
                                ? "#14532d"
                                : "#7f1d1d",
                            }}
                          >
                            {isReceive
                              ? "รับเข้า"
                              : "เบิกออก"}
                          </span>
                        </td>

                        <td
                          style={{
                            ...cellStyle,
                            color: isReceive
                              ? "#4ade80"
                              : "#f87171",
                            fontWeight: 700,
                            fontSize: 16,
                          }}
                        >
                          {isReceive ? "+" : "-"}
                          {transaction.quantity}
                        </td>

                        <td style={cellStyle}>
                          {transaction.user.username}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
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

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 24,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 30,
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 8,
  marginBottom: 0,
  color: "#a3a3a3",
  fontSize: 15,
};

const refreshButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

const messageStyle: React.CSSProperties = {
  marginBottom: 20,
  padding: "12px 16px",
  backgroundColor: "#1a1a1a",
  border: "1px solid #444",
  borderRadius: 8,
  color: "#ffffff",
};

const summaryStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const summaryCardStyle: React.CSSProperties = {
  backgroundColor: "#171717",
  border: "1px solid #333",
  borderRadius: 10,
  padding: 20,
};

const summaryLabelStyle: React.CSSProperties = {
  display: "block",
  color: "#a3a3a3",
  fontSize: 14,
  marginBottom: 8,
};

const summaryValueStyle: React.CSSProperties = {
  fontSize: 28,
  color: "#ffffff",
};

const tableCardStyle: React.CSSProperties = {
  backgroundColor: "#171717",
  border: "1px solid #333",
  borderRadius: 12,
  padding: 20,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const cellHeaderStyle: React.CSSProperties = {
  border: "1px solid #333",
  padding: "12px 14px",
  textAlign: "left",
  color: "#ffffff",
  backgroundColor: "#1f1f1f",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const cellStyle: React.CSSProperties = {
  border: "1px solid #333",
  padding: "12px 14px",
  color: "#ffffff",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: 999,
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 600,
};