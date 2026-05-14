"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAdminLoggedIn, adminLogout } from "@/lib/data";
import Link from "next/link";

const NAV = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/products", icon: "🎁", label: "Products" },
  { href: "/admin/orders", icon: "📦", label: "Orders" },
  { href: "/admin/coupons", icon: "🎟️", label: "Coupons" },
  { href: "/admin/sections", icon: "📂", label: "Sections" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn() && pathname !== "/admin") {
      router.replace("/admin");
    } else {
      setReady(true);
    }
  }, [router, pathname]);

  const logout = () => {
    adminLogout();
    router.push("/admin");
  };

  if (!ready) return null;
  if (pathname === "/admin") return <>{children}</>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F9FAFB", color: "#1F2937" }}>
      {/* Sidebar */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        width: 260, display: "flex", flexDirection: "column",
        background: "#FFFFFF", borderRight: "1px solid #E5E7EB",
        boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #F3F4F6" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Nunito',sans-serif" }}>
              <span style={{ background: "linear-gradient(135deg,#7C3AED,#E91E8C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Aradhya</span>
              <span style={{ color: "#9CA3AF", marginLeft: 4, fontSize: 12 }}>Admin</span>
            </span>
          </Link>
          <span style={{
            display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700,
            padding: "3px 10px", borderRadius: 6,
            background: "linear-gradient(135deg, #F5F3FF, #FFF0F5)",
            color: "#7C3AED", border: "1px solid #EDE9FE",
          }}>🛡️ Admin Panel</span>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {NAV.map(n => {
            const isActive = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 10, marginBottom: 4,
                  textDecoration: "none", fontSize: 14, fontWeight: 600,
                  fontFamily: "'Inter',sans-serif", transition: "all 0.2s",
                  background: isActive ? "linear-gradient(135deg, #F5F3FF, #FFF0F5)" : "transparent",
                  color: isActive ? "#7C3AED" : "#6B7280",
                  border: isActive ? "1px solid #EDE9FE" : "1px solid transparent",
                }}
              >
                <span style={{ fontSize: 16, minWidth: 22 }}>{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid #F3F4F6" }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 10, marginBottom: 4,
            textDecoration: "none", fontSize: 14, fontWeight: 600,
            color: "#6B7280",
          }}>
            <span style={{ fontSize: 16, minWidth: 22 }}>🌐</span>
            Public Site
          </Link>
          <button
            onClick={logout}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "10px", borderRadius: 10, border: "1.5px solid #FCA5A5",
              background: "#FEF2F2", color: "#DC2626", fontSize: 14, fontWeight: 700,
              cursor: "pointer", marginTop: 8,
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 260, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
