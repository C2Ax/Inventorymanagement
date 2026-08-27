"use client";

import { useEffect, useState } from "react";

type Product = {
  productId: string;
  productName: string;
  category: string;
  price: string;
  quantity: number;
  minimumStock: number;
};

type ProductForm = {
  productId: string;
  productName: string;
  category: string;
  price: string;
  quantity: string;
  minimumStock: string;
};

const initialForm: ProductForm = {
  productId: "",
  productName: "",
  category: "",
  price: "",
  quantity: "",
  minimumStock: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  // ถ้ามีค่า แปลว่ากำลังแก้ไขสินค้า
  const [editingId, setEditingId] = useState<string | null>(null);

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

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setMessage("");
  }

  // =========================
  // เพิ่ม / แก้ไข
  // =========================
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    if (
      !form.productId ||
      !form.productName ||
      !form.category ||
      !form.price ||
      !form.quantity ||
      !form.minimumStock
    ) {
      setMessage("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      setSubmitting(true);

      const isEditing = editingId !== null;

      const url = isEditing
        ? `/api/products/${editingId}`
        : "/api/products";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: form.productId,
          productName: form.productName,
          category: form.category,
          price: Number(form.price),
          quantity: Number(form.quantity),
          minimumStock: Number(form.minimumStock),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (isEditing
              ? "ไม่สามารถแก้ไขสินค้าได้"
              : "ไม่สามารถเพิ่มสินค้าได้")
        );
      }

      setMessage(
        isEditing
          ? "แก้ไขสินค้าสำเร็จ"
          : "เพิ่มสินค้าสำเร็จ"
      );

      resetForm();

      await loadProducts();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          editingId
            ? "ไม่สามารถแก้ไขสินค้าได้"
            : "ไม่สามารถเพิ่มสินค้าได้"
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  // =========================
  // เริ่มแก้ไข
  // =========================
  function handleEdit(product: Product) {
    setEditingId(product.productId);

    setForm({
      productId: product.productId,
      productName: product.productName,
      category: product.category,
      price: String(product.price),
      quantity: String(product.quantity),
      minimumStock: String(product.minimumStock),
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================
  // ลบสินค้า
  // =========================
  async function handleDelete(productId: string) {
    const confirmed = window.confirm(
      `ต้องการลบสินค้า ${productId} ใช่หรือไม่?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "ไม่สามารถลบสินค้าได้"
        );
      }

      setMessage("ลบสินค้าสำเร็จ");

      await loadProducts();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("ไม่สามารถลบสินค้าได้");
      }
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        กำลังโหลดสินค้า...
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <h1>จัดการสินค้า</h1>

      {message && (
        <p
          style={{
            padding: 10,
            marginTop: 16,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          {message}
        </p>
      )}

      {/* =========================
          Form
      ========================= */}
      <section
        style={{
          marginTop: 24,
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      >
        <h2>
          {editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: 12,
            maxWidth: 500,
          }}
        >
          <input
            name="productId"
            placeholder="รหัสสินค้า"
            value={form.productId}
            onChange={handleChange}
            disabled={editingId !== null}
          />

          <input
            name="productName"
            placeholder="ชื่อสินค้า"
            value={form.productName}
            onChange={handleChange}
          />

          <input
            name="category"
            placeholder="หมวดหมู่"
            value={form.category}
            onChange={handleChange}
          />

          <input
            name="price"
            type="number"
            placeholder="ราคา"
            value={form.price}
            onChange={handleChange}
          />

          <input
            name="quantity"
            type="number"
            placeholder="จำนวนสินค้า"
            value={form.quantity}
            onChange={handleChange}
          />

          <input
            name="minimumStock"
            type="number"
            placeholder="Minimum Stock"
            value={form.minimumStock}
            onChange={handleChange}
          />

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 16px",
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {submitting
                ? "กำลังบันทึก..."
                : editingId
                  ? "บันทึกการแก้ไข"
                  : "เพิ่มสินค้า"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "10px 16px",
                }}
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </section>

      {/* =========================
          Product Table
      ========================= */}
      <section style={{ marginTop: 32 }}>
        <h2>รายการสินค้า</h2>

        <p>
          จำนวนสินค้าทั้งหมด: {products.length}
        </p>

        {products.length === 0 ? (
          <p>ยังไม่มีสินค้า</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 20,
            }}
          >
            <thead>
              <tr>
                <th style={cellStyle}>รหัส</th>
                <th style={cellStyle}>ชื่อสินค้า</th>
                <th style={cellStyle}>หมวดหมู่</th>
                <th style={cellStyle}>ราคา</th>
                <th style={cellStyle}>Stock</th>
                <th style={cellStyle}>
                  Minimum Stock
                </th>
                <th style={cellStyle}>การจัดการ</th>
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

                  <td style={cellStyle}>
                    {product.category}
                  </td>

                  <td style={cellStyle}>
                    {product.price}
                  </td>

                  <td style={cellStyle}>
                    {product.quantity}
                  </td>

                  <td style={cellStyle}>
                    {product.minimumStock}
                  </td>

                  <td style={cellStyle}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={() =>
                          handleEdit(product)
                        }
                      >
                        แก้ไข
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            product.productId
                          )
                        }
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

const cellStyle = {
  border: "1px solid #ddd",
  padding: 10,
};