"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

type Role =
  | "ADMIN"
  | "MANAGER"
  | "WAREHOUSE"
  | "PURCHASING";

type RoleGuardProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

export default function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();

    // ยังไม่ได้ Login
    if (!user) {
      router.replace("/login");
      return;
    }

    // ADMIN เข้าถึงได้ทุกหน้า
    if (user.role === "ADMIN") {
      setAuthorized(true);
      return;
    }

    // ตรวจสอบ Role
    if (allowedRoles.includes(user.role as Role)) {
      setAuthorized(true);
      return;
    }

    // ไม่มีสิทธิ์
    router.replace("/dashboard");
  }, [allowedRoles, router]);

  if (!authorized) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f0f0f",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 24,
              marginBottom: 8,
            }}
          >
            กำลังตรวจสอบสิทธิ์...
          </h1>

          <p
            style={{
              color: "#a3a3a3",
              margin: 0,
            }}
          >
            กรุณารอสักครู่
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}