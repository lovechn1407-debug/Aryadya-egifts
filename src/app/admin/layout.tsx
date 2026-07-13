"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAdminLoggedIn, adminLogout } from "@/lib/data";
import Link from "next/link";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";

const NAV = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/analytics", icon: "📈", label: "Analytics" },
  { href: "/admin/products", icon: "🎁", label: "Products" },
  { href: "/admin/orders", icon: "📦", label: "Orders" },
  { href: "/admin/chats", icon: "💬", label: "Chats" },
  { href: "/admin/coupons", icon: "🎟️", label: "Coupons" },
  { href: "/admin/sections", icon: "📂", label: "Sections" },
  { href: "/admin/songs", icon: "🎵", label: "Songs" },
  { href: "/admin/video-library", icon: "📹", label: "Video Library" },
  { href: "/admin/faqs", icon: "❓", label: "FAQs" },
  { href: "/admin/reviews", icon: "⭐", label: "Reviews" },
  { href: "/admin/popups", icon: "🗂️", label: "Popups" },
  { href: "/admin/whatsapp", icon: "🟢", label: "WhatsApp Bot" },
  { href: "/admin/settings", icon: "⚙️", label: "Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);

  // Real-time chat unread badge
  useEffect(() => {
    const chatsRef = ref(database, "chats");
    const handle = onValue(chatsRef, (snap) => {
      if (!snap.exists()) { setChatUnread(0); return; }
      const raw = snap.val() as Record<string, { meta?: { unreadByAdmin?: number } }>;
      const total = Object.values(raw).reduce((sum, chat) => sum + (chat.meta?.unreadByAdmin || 0), 0);
      setChatUnread(total);
    });
    return () => off(chatsRef, "value", handle);
  }, []);

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
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", color: "#0F172A", fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        width: 260, display: "flex", flexDirection: "column",
        background: "#FFFFFF", borderRight: "1px solid #E2E8F0",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/logo.png" alt="Aradhya E-Giftings Admin" style={{ height: 40, objectFit: "contain" }} />
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4, display: "block" }}>Admin Workspace</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: "8px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, padding: "12px 8px 8px" }}>Menu</div>
          {NAV.map(n => {
            const isActive = pathname === n.href;
            const isChats = n.href === "/admin/chats";
            const badge = isChats && chatUnread > 0 ? chatUnread : 0;
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 8,
                  textDecoration: "none", fontSize: 14, fontWeight: 500,
                  transition: "all 0.15s",
                  background: isActive ? "#EDE9FE" : "transparent",
                  color: isActive ? "#7C3AED" : "#64748B",
                  position: "relative",
                }}
                onMouseEnter={e => {
                  if (!isActive) { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = "#334155"; }
                }}
                onMouseLeave={e => {
                  if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; }
                }}
              >
                <span style={{ fontSize: 16, opacity: isActive ? 1 : 0.7 }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {badge > 0 && (
                  <span style={{
                    background: "#EF4444", color: "#fff", borderRadius: 20,
                    fontSize: 10, fontWeight: 700, padding: "2px 6px", minWidth: 18,
                    textAlign: "center", lineHeight: "14px",
                  }}>{badge > 99 ? "99+" : badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "16px", borderTop: "1px solid #E2E8F0" }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px", borderRadius: 8, marginBottom: 4,
            textDecoration: "none", fontSize: 14, fontWeight: 500,
            color: "#64748B", transition: "all 0.15s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = "#334155"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; }}
          >
            <span style={{ fontSize: 16, opacity: 0.7 }}>🌐</span>
            View Public Site
          </Link>
          <button
            onClick={logout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 8, border: "none",
              background: "transparent", color: "#EF4444", fontSize: 14, fontWeight: 500,
              cursor: "pointer", transition: "all 0.15s", textAlign: "left",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 16 }}>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 260, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Top Header */}
        <header style={{
          height: 64, background: "#FFFFFF", borderBottom: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", padding: "0 32px",
          position: "sticky", top: 0, zIndex: 40,
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", margin: 0, textTransform: "capitalize" }}>
              {pathname.split("/").pop() || "Dashboard"}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              👨‍💻
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, padding: "32px", overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
