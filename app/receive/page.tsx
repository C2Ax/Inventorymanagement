"use client";

import { useEffect, useState } from "react";

type Product = {
  productId: string;
  productName: string;
  quantity: number;
};

export default function ReceivePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error("ไม่สามารถโหลดสินค้าได้");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      setMessage("ไม่สามารถโหลดข้อมูลสินค้าได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    const amount = Number(quantity);

    if (!productId) {
      setMessage("กรุณาเลือกสินค้า");
      return;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      setMessage("กรุณากรอกจำนวนสินค้าที่มากกว่า 0");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/stock/receive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: amount,
          userId: "user001",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "ไม่สามารถรับสินค้าเข้าได้"
        );
      }

      setMessage(
        `รับสินค้าเข้าคลังสำเร็จ จำนวน ${amount} ชิ้น`
      );

      setQuantity("");

      // โหลด Stock ใหม่หลังรับสินค้า
      await loadProducts();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("ไม่สามารถรับสินค้าเข้าได้");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f0f0f",
          color: "#ffffff",
          padding: 32,
        }}
      >
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          กำลังโหลดสินค้า...
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        color: "#ffffff",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: 30,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          รับสินค้าเข้าคลัง
        </h1>

        {/* Message */}
        {message && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 16px",
              backgroundColor: "#1a1a1a",
              border: "1px solid #444",
              borderRadius: 8,
              color: "#ffffff",
              fontSize: 15,
            }}
          >
            {message}
          </div>
        )}

        {/* Form Card */}
        <section
          style={{
            backgroundColor: "#171717",
            border: "1px solid #333",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: 20,
            }}
          >
            {/* Product */}
            <div>
              <label
                htmlFor="product"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                สินค้า
              </label>

              <select
                id="product"
                value={productId}
                onChange={(event) =>
                  setProductId(event.target.value)
                }
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 14px",
                  backgroundColor: "#1f1f1f",
                  color: "#ffffff",
                  border: "1px solid #555",
                  borderRadius: 8,
                  fontSize: 16,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option
                  value=""
                  style={{
                    backgroundColor: "#1f1f1f",
                    color: "#ffffff",
                  }}
                >
                  -- เลือกสินค้า --
                </option>

                {products.map((product) => (
                  <option
                    key={product.productId}
                    value={product.productId}
                    style={{
                      backgroundColor: "#1f1f1f",
                      color: "#ffffff",
                    }}
                  >
                    {product.productId} -{" "}
                    {product.productName} (Stock:{" "}
                    {product.quantity})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                จำนวนที่รับเข้า
              </label>

              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                placeholder="กรอกจำนวน"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 14px",
                  backgroundColor: "#1f1f1f",
                  color: "#ffffff",
                  border: "1px solid #555",
                  borderRadius: 8,
                  fontSize: 16,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "13px 20px",
                marginTop: 4,
                backgroundColor: submitting
                  ? "#374151"
                  : "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {submitting
                ? "กำลังบันทึก..."
                : "รับสินค้าเข้าคลัง"}
            </button>
          </form>
        </section>

        {/* Current Stock */}
        <section
          style={{
            marginTop: 32,
            backgroundColor: "#171717",
            border: "1px solid #333",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            Stock ปัจจุบัน
          </h2>

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={cellStyle}>รหัส</th>
                  <th style={cellStyle}>สินค้า</th>
                  <th style={cellStyle}>Stock</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.productId}>
                    <td style={cellStyle}>
                      {product.productId}
                    </td>

                    <td style={cellStyle}>
                      {product.productName}
                    </td>

                    <td
                      style={{
                        ...cellStyle,
                        fontWeight: 600,
                      }}
                    >
                      {product.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid #333",
  padding: "12px 14px",
  textAlign: "left",
  color: "#ffffff",
};