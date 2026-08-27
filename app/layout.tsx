import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Inventory Management",
  description: "ระบบจัดการสินค้าคงคลัง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}