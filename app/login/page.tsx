"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  message?: string;
  error?: string;
  user?: {
    userId: string;
    username: string;
    role: string;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!username || !password) {
      setError("กรุณากรอก Username และ Password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.user) {
        throw new Error(
          data.error || "เข้าสู่ระบบไม่สำเร็จ"
        );
      }

      // เก็บข้อมูล User ที่ login สำเร็จ
      localStorage.setItem(
        "inventory_user",
        JSON.stringify(data.user)
      );

      // ไปหน้า Dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("เข้าสู่ระบบไม่สำเร็จ");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: "#171717",
          border: "1px solid #333",
          borderRadius: 14,
          padding: 32,
          boxShadow:
            "0 15px 40px rgba(0, 0, 0, 0.35)",
        }}
      >
        {/* Logo / Title */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            Inventory
          </h1>

          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              color: "#a3a3a3",
            }}
          >
            ระบบจัดการสินค้าคงคลัง
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 14px",
              backgroundColor: "#451a1a",
              border: "1px solid #7f1d1d",
              borderRadius: 8,
              color: "#fca5a5",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: 18,
          }}
        >
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="กรอก username"
              autoComplete="username"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="กรอก password"
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 20px",
              marginTop: 6,
              backgroundColor: loading
                ? "#374151"
                : "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "กำลังเข้าสู่ระบบ..."
              : "เข้าสู่ระบบ"}
          </button>
        </form>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  backgroundColor: "#1f1f1f",
  color: "#ffffff",
  border: "1px solid #555",
  borderRadius: 8,
  fontSize: 16,
  outline: "none",
};