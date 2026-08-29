"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Creator, AffiliateMilestone, AffiliateReward, Payout, RewardClaim, RewardType } from "@/lib/db";
import type { Coupon } from "@/lib/data";
import {
  LayoutDashboard, Ticket, ShoppingBag, Banknote, Settings,
  LogOut, ChevronRight, Check, Clock, Copy, ArrowUpRight,
  ArrowDownRight, Loader2, Info, Gift, DollarSign, Target,
  TrendingUp, Activity, CheckCircle, Smartphone, ExternalLink,
  Menu, User, Phone, Camera, Video, Globe, Landmark, Wallet
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import icons from "payments-icons-library";

interface OrderSummary {
  id: string; productName: string; buyerName: string;
  amount: number; commissionAmount: number; couponCode?: string;
  status: string; createdAt: string;
}

interface DashboardData {
  creator: Creator;
  coupons: Coupon[];
  orders: OrderSummary[];
  payouts: Payout[];
  milestones: AffiliateMilestone[];
  rewards: AffiliateReward[];
  rewardClaims: RewardClaim[];
  monthlyEarnings: Record<string, number>;
  pendingPayoutPaise: number;
}

function fmt(paise: number) { return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }

/* ── UI Helpers ── */

function RewardIcon({ type, size = 20 }: { type?: RewardType, size?: number }) {
  if (type === "amazon") return <img src="/icons/amazon.png" alt="Amazon" style={{ width: size, height: size, objectFit: "contain", borderRadius: 4 }} />;
  if (type === "flipkart") return <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg" alt="Flipkart" style={{ width: size, height: size, objectFit: "contain", borderRadius: 4 }} />;
  if (type === "myntra") return <img src="/icons/myntra.png" alt="Myntra" style={{ width: size, height: size, objectFit: "contain", borderRadius: 4 }} />;
  if (type === "cash") return <img src="/icons/flipkart.png" alt="UPI" style={{ width: size, height: size, objectFit: "contain", borderRadius: 4 }} />;
  return <Gift size={size} color="#64748B" strokeWidth={2.5} />;
}

/* ── Mobile-First Custom Components ── */

function NativeButton({ children, variant = "primary", onClick, disabled, loading, style }: any) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 15, fontWeight: 600,
        border: "none", cursor: disabled ? "not-allowed" : "pointer",
        background: isPrimary ? "#111827" : isDanger ? "#FEE2E2" : "#F3F4F6",
        color: isPrimary ? "#FFFFFF" : isDanger ? "#DC2626" : "#111827",
        opacity: disabled ? 0.5 : 1, transition: "opacity 0.2s",
        ...style
      }}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : children}
    </button>
  );
}

function NativeInput({ icon: Icon, placeholder, type = "text", value, onChange, required }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "0 16px",
      background: focused ? "#FFFFFF" : "#F9FAFB",
      border: `2px solid ${focused ? "#3B82F6" : "#E5E7EB"}`,
      borderRadius: 16, transition: "all 0.2s ease",
      boxShadow: focused ? "0 4px 12px rgba(59, 130, 246, 0.1)" : "none"
    }}>
      {Icon && <Icon size={20} color={focused ? "#3B82F6" : "#9CA3AF"} style={{ transition: "color 0.2s ease" }} />}
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          flex: 1, padding: "16px 0", background: "transparent", border: "none",
          fontSize: 16, outline: "none", color: "#111827", width: "100%"
        }}
      />
    </div>
  );
}

function NativeListItem({ title, subtitle, rightValue, rightSub, icon: Icon, onClick, style }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 0", borderBottom: "1px solid #E5E7EB", cursor: onClick ? "pointer" : "default",
        ...style
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {Icon && (
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#4B5563" }}>
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{title}</span>
          {subtitle && <span style={{ fontSize: 13, color: "#6B7280" }}>{subtitle}</span>}
        </div>
      </div>
      {(rightValue || rightSub) && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          {rightValue && <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{rightValue}</span>}
          {rightSub && <span style={{ fontSize: 13, color: "#6B7280" }}>{rightSub}</span>}
        </div>
      )}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: { message: string; type: "success" | "error" | "info" } | null; onClose: () => void }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  
  return (
    <div style={{
      position: "fixed", top: 16, left: 16, right: 16, zIndex: 99999,
      display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12,
      background: "#111827", color: "#FFFFFF", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
      animation: "toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      <div style={{ color: isSuccess ? "#10B981" : "#EF4444" }}>
        {isSuccess ? <CheckCircle size={20} /> : <Info size={20} />}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{toast.message}</div>
      <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#9CA3AF", padding: 4 }}>
        ✕
      </button>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toastIn { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}} />
    </div>
  );
}

function PremiumMissionItem({ title, subtitle, rightValue, ratio, statusColor, isFulfilled, isPending, unlocked, icon: Icon, onClick, current, total }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative", padding: "20px", borderRadius: 16, cursor: "pointer", overflow: "hidden",
        background: isFulfilled ? "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)" : isPending ? "linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)" : unlocked ? "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)" : "#FFFFFF",
        border: `1px solid ${isFulfilled ? "#A7F3D0" : isPending ? "#FDE68A" : unlocked ? "#BFDBFE" : "#E5E7EB"}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: 16,
        transition: "transform 0.2s, box-shadow 0.2s"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            position: "relative", width: 48, height: 48, borderRadius: 14,
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            {Icon && <Icon size={24} />}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>{title}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: statusColor }}>{subtitle}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
            background: isFulfilled ? "#D1FAE5" : isPending ? "#FEF3C7" : unlocked ? "#DBEAFE" : "#F3F4F6",
            color: statusColor
          }}>
            {rightValue}
          </span>
          <ChevronRight size={16} color="#9CA3AF" />
        </div>
      </div>
      
      {!isFulfilled && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#6B7280" }}>
            <span>Progress</span>
            <span>{current} / {total}</span>
          </div>
          <div style={{ height: 6, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${ratio}%`, background: statusColor, borderRadius: 99, transition: "width 0.5s ease" }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */

export default function CreatorDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "rewards" | "sales" | "settings">("overview");
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [settingsForm, setSettingsForm] = useState({
    name: "", phone: "", instagram: "", youtube: "", other: "", upiId: "", upiName: ""
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [upiMessage, setUpiMessage] = useState<{text: string, type: "success"|"error"} | null>(null);

  const upiIconUrl = useMemo(() => {
    if (!settingsForm.upiId || !settingsForm.upiId.includes('@')) return null;
    try {
      const domain = settingsForm.upiId.split('@')[1].toLowerCase();
      let mapped = domain;
      if (domain.startsWith('ok')) mapped = 'gpay';
      else if (['ybl', 'ibl', 'axl'].includes(domain) || domain.includes('phonepe')) mapped = 'phonepe';
      else if (domain.includes('paytm')) mapped = 'paytm';
      else if (domain.includes('fam')) mapped = 'fampay';
      else if (domain.includes('apl')) mapped = 'amazon';
      else if (domain.includes('bhim')) mapped = 'bhim';
      else if (domain.includes('mobikwik')) mapped = 'mobikwik';
      else if (domain.includes('freecharge')) mapped = 'freecharge';
      else if (domain.includes('icici')) mapped = 'icici';
      else if (domain.includes('hdfc')) mapped = 'hdfc';
      else if (domain.includes('sbi')) mapped = 'sbi';
      else if (domain.includes('axis')) mapped = 'axis';
      else if (domain.includes('yes')) mapped = 'yes';
      else if (domain.includes('kotak')) mapped = 'kotak';
      
      const iconData = icons.getIcon(mapped, 'svg');
      if (iconData && iconData.icon_name !== 'default') return iconData.icon_url;
    } catch (e) {
      // ignore
    }
    return null;
  }, [settingsForm.upiId]);

  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [viewingClaim, setViewingClaim] = useState<RewardClaim | null>(null);
  const [selectedReward, setSelectedReward] = useState<AffiliateReward | null>(null); // For slide-up details panel

  const fetchData = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/creator/me?uid=${userId}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        setSettingsForm({
          name: json.creator.name || "", phone: json.creator.phone || "",
          instagram: json.creator.instagramHandle || "", youtube: json.creator.youtubeHandle || "",
          other: json.creator.otherHandle || "", upiId: json.creator.upiId || "", upiName: json.creator.upiName || "",
        });
      } else {
        router.replace("/creator");
      }
    } catch {
      router.replace("/creator");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.replace("/creator"); return; }
      await fetchData(user.uid);
    });
    return () => unsub();
  }, [router, fetchData]);

  const handleClaimReward = async (rewardId: string) => {
    if (!data?.creator.uid) return;
    setClaimingRewardId(rewardId);
    try {
      const res = await fetch("/api/creator/claim-reward", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId, creatorId: data.creator.uid }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Claim submitted successfully.", "success");
        setSelectedReward(null);
        await fetchData(data.creator.uid);
      } else {
        showToast(json.message || "Failed to claim reward.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setClaimingRewardId(null);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied`, "success");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/creator/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: data.creator.uid, email: data.creator.email,
          name: settingsForm.name, phone: settingsForm.phone,
          instagramHandle: settingsForm.instagram, youtubeHandle: settingsForm.youtube,
          otherHandle: settingsForm.other, upiId: settingsForm.upiId, upiName: settingsForm.upiName
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Profile updated.", "success");
        await fetchData(data.creator.uid);
      } else {
        showToast(json.message || "Update failed.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error updating settings.", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleVerifyUpi = async () => {
    if (!settingsForm.upiId) return setUpiMessage({text: "Enter a UPI ID first.", type: "error"});
    setVerifyingUpi(true);
    setUpiMessage(null);
    try {
      const res = await fetch("/api/creator/verify-upi", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId: settingsForm.upiId })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsForm({ ...settingsForm, upiName: data.payeeAccountName });
        setUpiMessage({text: `Verified: ${data.payeeAccountName}`, type: "success"});
      } else if (data.isQueryPatternValid) {
        setUpiMessage({text: "UPI ID format verified", type: "success"});
      } else {
        setUpiMessage({text: data.message || "Invalid UPI ID", type: "error"});
      }
    } catch (e: any) {
      setUpiMessage({text: "Verification failed. Try manually.", type: "error"});
    } finally {
      setVerifyingUpi(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
        <Loader2 size={32} color="#111827" className="animate-spin" />
      </div>
    );
  }

  const { creator, coupons, orders, payouts, rewards, rewardClaims, monthlyEarnings, pendingPayoutPaise } = data;
  const paidOrders = orders.filter(o => o.status === "PAID");
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthEarnings = monthlyEarnings[thisMonth] || 0;

  const tabs = [
    { id: "overview", label: "Home", icon: LayoutDashboard },
    { id: "rewards", label: "Missions", icon: Target },
    { id: "sales", label: "History", icon: Activity },
    { id: "settings", label: "Profile", icon: Settings },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", color: "#111827", paddingBottom: 100 }}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Native App Header ── */}
      <header style={{
        padding: "16px 24px", background: "#FFFFFF", position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #E5E7EB", boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" alt="Aradhya E-Gifting" style={{ height: 44, objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>Creator</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{creator.name?.split(" ")[0] || "Account"}</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: "#F3F4F6", color: "#111827",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700,
            overflow: "hidden"
          }}>
            {creator.photoURL ? (
              <img src={creator.photoURL} alt={creator.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              creator.name?.charAt(0)?.toUpperCase() || "C"
            )}
          </div>
        </div>
      </header>

      <main style={{ padding: "0 24px" }}>
        
        {/* ── HOME TAB ── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 12 }}>
            
            {/* Hero Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Earnings</div>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", color: "#111827", display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 32, color: "#9CA3AF" }}>₹</span>
                {(creator.totalEarningsPaise / 100).toLocaleString("en-IN")}
              </div>
              
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <div style={{ background: "#DCFCE7", color: "#166534", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <TrendingUp size={14} /> +{fmt(thisMonthEarnings)} this month
                </div>
                {pendingPayoutPaise > 0 && (
                  <div style={{ background: "#FEF3C7", color: "#92400E", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={14} /> {fmt(pendingPayoutPaise)} pending
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions (Coupons) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Your Codes</div>
              {coupons.slice(0, 2).map(c => (
                <div key={c.id} style={{
                  background: "#FFFFFF", padding: 20, borderRadius: 16,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "0.02em" }}>{c.id}</div>
                    <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
                      {c.discountType === "percentage" ? `${c.discountAmount}% off` : `₹${c.discountAmount} off`} • {c.commissionPercentage}% comm.
                    </div>
                  </div>
                  <button onClick={() => handleCopyText(c.id, "Code")} style={{
                    width: 44, height: 44, borderRadius: "50%", background: "#F3F4F6", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#111827"
                  }}>
                    <Copy size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Static Bonus Commission Milestone */}
            <div style={{
              background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)", borderRadius: 16, padding: 24,
              color: "#FFFFFF", position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1 }}>
                <Target size={120} />
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
                  Coming Soon
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Unlock 5% Extra Commision</div>
                <div style={{ fontSize: 15, color: "#D1D5DB", lineHeight: 1.5, marginBottom: 24, maxWidth: "90%" }}>
                  Reach 100 overall sales to permanently boost your earning rate on all future orders.
                </div>
                
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    <span>Progress</span>
                    <span>{creator.totalReferrals} / 100</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (creator.totalReferrals / 100) * 100)}%`, background: "#10B981", borderRadius: 99 }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── MISSIONS TAB ── */}
        {activeTab === "rewards" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 12 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Missions</h1>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {rewards.map(r => {
                const claim = rewardClaims.find(c => c.rewardId === r.id);
                const unlocked = creator.totalReferrals >= r.referrals;
                const ratio = Math.min(100, Math.round((creator.totalReferrals / r.referrals) * 100));
                const isPending = claim?.status === "pending";
                const isFulfilled = claim?.status === "fulfilled";

                let statusColor = "#6B7280";
                let statusText = `${ratio}%`;
                if (isFulfilled) { statusColor = "#10B981"; statusText = "Delivered"; }
                else if (isPending) { statusColor = "#F59E0B"; statusText = "Reviewing"; }
                else if (unlocked) { statusColor = "#3B82F6"; statusText = "Claim Now"; }

                return (
                  <PremiumMissionItem
                    key={r.id}
                    title={r.label}
                    subtitle={`Reward: ${fmt(r.rewardAmountPaise)}`}
                    rightValue={statusText}
                    ratio={ratio}
                    statusColor={statusColor}
                    isFulfilled={isFulfilled}
                    isPending={isPending}
                    unlocked={unlocked}
                    current={creator.totalReferrals}
                    total={r.referrals}
                    onClick={() => setSelectedReward(r)}
                    icon={({ size }: any) => <RewardIcon type={r.rewardType} size={size} />}
                  />
                );
              })}
              {rewards.length === 0 && <div style={{ padding: "40px 0", textAlign: "center", color: "#6B7280", fontSize: 15 }}>No missions available.</div>}
            </div>
          </div>
        )}

        {/* ── HISTORY TAB (Sales & Payouts) ── */}
        {activeTab === "sales" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 12 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>History</h1>
            
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Recent Payouts</h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {payouts.length === 0 ? (
                  <div style={{ color: "#6B7280", padding: "20px 0", fontSize: 14 }}>No payouts yet.</div>
                ) : payouts.map(p => (
                  <NativeListItem
                    key={p.id}
                    icon={Banknote}
                    title={fmt(p.amountPaise)}
                    subtitle={new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    rightValue={p.status === "paid" ? "Paid" : "Pending"}
                    rightSub={p.reference || "Processing"}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Recent Sales</h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {paidOrders.length === 0 ? (
                  <div style={{ color: "#6B7280", padding: "20px 0", fontSize: 14 }}>No sales yet.</div>
                ) : paidOrders.slice(0, 10).map(o => (
                  <NativeListItem
                    key={o.id}
                    icon={ShoppingBag}
                    title={o.productName}
                    subtitle={new Date(o.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    rightValue={`+${fmt(o.commissionAmount)}`}
                    rightSub={`Order: ${fmt(o.amount)}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 12 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Profile</h1>

            {/* Profile Card */}
            <div style={{
              background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)", borderRadius: 20, padding: 24,
              color: "#FFFFFF", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", background: "#3B82F6",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#FFFFFF",
                boxShadow: "0 0 0 4px rgba(255,255,255,0.1)", overflow: "hidden", flexShrink: 0
              }}>
                {creator.photoURL ? (
                  <img src={creator.photoURL} alt={creator.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  creator.name?.charAt(0)?.toUpperCase() || "C"
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{creator.name}</h2>
                <div style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{creator.email}</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {settingsForm.instagram && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 99 }}>
                      <FaInstagram color="#E1306C" size={16} /> <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>{settingsForm.instagram.replace(/^@/, '')}</span>
                    </div>
                  )}
                  {settingsForm.youtube && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 99 }}>
                      <FaYoutube color="#FF0000" size={16} /> <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>{settingsForm.youtube.replace(/^@/, '')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Personal Info</div>
                <NativeInput icon={User} placeholder="Full Name" value={settingsForm.name} onChange={(e: any) => setSettingsForm({ ...settingsForm, name: e.target.value })} required />
                <NativeInput icon={Phone} type="tel" placeholder="Phone Number" value={settingsForm.phone} onChange={(e: any) => setSettingsForm({ ...settingsForm, phone: e.target.value })} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Social Links</div>
                <NativeInput icon={Camera} placeholder="Instagram Username" value={settingsForm.instagram} onChange={(e: any) => setSettingsForm({ ...settingsForm, instagram: e.target.value })} />
                <NativeInput icon={Video} placeholder="YouTube Channel" value={settingsForm.youtube} onChange={(e: any) => setSettingsForm({ ...settingsForm, youtube: e.target.value })} />
                <NativeInput icon={Globe} placeholder="Other Links (Website, etc.)" value={settingsForm.other} onChange={(e: any) => setSettingsForm({ ...settingsForm, other: e.target.value })} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Payout Details (UPI)</div>
                <div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <NativeInput icon={() => upiIconUrl ? <img src={upiIconUrl} alt="bank" style={{width:24, height:24, objectFit:"contain"}}/> : <Wallet size={20} color="#9CA3AF"/>} placeholder="UPI ID (e.g., name@upi)" value={settingsForm.upiId} onChange={(e: any) => setSettingsForm({ ...settingsForm, upiId: e.target.value })} />
                    </div>
                    <button type="button" onClick={handleVerifyUpi} disabled={verifyingUpi} style={{
                      padding: "0 20px", height: 56, background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                      color: "#FFFFFF", border: "none", borderRadius: 16, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                      fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "transform 0.2s, box-shadow 0.2s"
                    }}>
                      {verifyingUpi ? <Loader2 size={18} className="animate-spin" /> : "Verify"}
                    </button>
                  </div>
                  {upiMessage && (
                    <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: upiMessage.type === "success" ? "#10B981" : "#EF4444", display: "flex", alignItems: "center", gap: 6, paddingLeft: 12 }}>
                      {upiMessage.type === "success" ? <CheckCircle size={16} /> : <Info size={16} />}
                      {upiMessage.text}
                    </div>
                  )}
                </div>
                <NativeInput icon={Landmark} placeholder="Account Holder Name" value={settingsForm.upiName} onChange={(e: any) => setSettingsForm({ ...settingsForm, upiName: e.target.value })} />
              </div>

              <NativeButton type="submit" loading={settingsSaving} style={{ marginTop: 12 }}>
                Save Profile
              </NativeButton>

              <NativeButton type="button" variant="danger" onClick={async () => { await auth.signOut(); router.push("/creator"); }} style={{ marginTop: 24, background: "transparent", border: "1px solid #FCA5A5" }}>
                Log Out
              </NativeButton>
            </form>
          </div>
        )}

      </main>

      {/* ── NATIVE BOTTOM NAVIGATION ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(249, 250, 251, 0.9)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(229, 231, 235, 0.5)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: 60, padding: "0 8px" }}>
          {tabs.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id} onClick={() => setActiveTab(item.id as any)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                  height: "100%", background: "transparent", border: "none", cursor: "pointer",
                  color: isActive ? "#111827" : "#9CA3AF"
                }}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── SLIDE-UP MISSION PANEL ── */}
      {selectedReward && (
        <>
          <div onClick={() => setSelectedReward(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, backdropFilter: "blur(4px)", animation: "fadeIn 0.2s" }} />
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 101,
            background: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: "24px 24px calc(24px + env(safe-area-inset-bottom))",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            {(() => {
              const r = selectedReward;
              const claim = rewardClaims.find(c => c.rewardId === r.id);
              const unlocked = creator.totalReferrals >= r.referrals;
              const isPending = claim?.status === "pending";
              const isFulfilled = claim?.status === "fulfilled";

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <RewardIcon type={r.rewardType} size={32} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{r.label}</h3>
                      <div style={{ fontSize: 14, color: "#6B7280" }}>{fmt(r.rewardAmountPaise)} Reward</div>
                    </div>
                  </div>

                  <p style={{ fontSize: 15, color: "#4B5563", lineHeight: 1.5, margin: 0 }}>
                    {r.description || `Complete ${r.referrals} successful referrals to claim your reward.`}
                  </p>

                  <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                      <span style={{ color: "#6B7280" }}>Your Progress</span>
                      <span style={{ color: "#111827" }}>{creator.totalReferrals} / {r.referrals} Sales</span>
                    </div>
                    <div style={{ height: 6, background: "#E5E7EB", borderRadius: 99 }}>
                      <div style={{ height: "100%", width: `${Math.min(100, (creator.totalReferrals / r.referrals) * 100)}%`, background: "#3B82F6", borderRadius: 99 }} />
                    </div>
                  </div>

                  {/* Actions */}
                  {isFulfilled ? (
                    r.rewardType === "cash" ? (
                      <div style={{ padding: 16, borderRadius: 12, background: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#065F46", fontSize: 15, fontWeight: 600 }}>
                          <CheckCircle size={20} /> Cash Credited
                        </div>
                        {claim?.utr && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "#065F46" }}>UTR: {claim.utr}</span>
                            <button onClick={() => handleCopyText(claim.utr!, "UTR")} style={{ background: "transparent", border: "none", color: "#065F46", cursor: "pointer" }}><Copy size={18} /></button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <NativeButton onClick={() => { setSelectedReward(null); setViewingClaim(claim!); }}>
                        <Ticket size={18} /> Show Voucher Code
                      </NativeButton>
                    )
                  ) : isPending ? (
                    <div style={{ padding: 16, borderRadius: 12, background: "#FFFBEB", border: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: 12, color: "#92400E", fontSize: 15, fontWeight: 600 }}>
                      <Clock size={20} /> Processing (24h SLA)
                    </div>
                  ) : (
                    <NativeButton disabled={!unlocked} loading={claimingRewardId === r.id} onClick={() => handleClaimReward(r.id)}>
                      {unlocked ? "Claim Reward" : `${r.referrals - creator.totalReferrals} More Sales Needed`}
                    </NativeButton>
                  )}
                  
                  <button onClick={() => setSelectedReward(null)} style={{ background: "transparent", border: "none", fontSize: 15, fontWeight: 600, color: "#6B7280", padding: 12 }}>
                    Close
                  </button>
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* ── VOUCHER MODAL ── */}
      {viewingClaim && (
        <>
          <div onClick={() => setViewingClaim(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, backdropFilter: "blur(12px)", animation: "fadeIn 0.2s" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 201,
            width: "90%", maxWidth: 380, animation: "popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            {/* Ticket Top */}
            <div style={{
              background: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32,
              textAlign: "center", position: "relative"
            }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <RewardIcon type={viewingClaim.rewardType} size={40} />
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 8px", color: "#111827" }}>{viewingClaim.rewardLabel}</h3>
              <p style={{ fontSize: 15, color: "#10B981", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <CheckCircle size={18} /> Voucher is Ready
              </p>
            </div>

            {/* Ticket Divider */}
            <div style={{ display: "flex", width: "100%", height: 32, overflow: "hidden", position: "relative", background: "transparent" }}>
              <div style={{ position: "absolute", top: 0, left: -16, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.7)", zIndex: 1 }} />
              <div style={{ position: "absolute", top: 15, left: 16, right: 16, borderTop: "2px dashed #E5E7EB" }} />
              <div style={{ position: "absolute", top: 0, right: -16, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.7)", zIndex: 1 }} />
              <div style={{ width: "100%", height: "100%", background: "#FFFFFF" }} />
            </div>

            {/* Ticket Bottom */}
            <div style={{
              background: "#FFFFFF", borderBottomLeftRadius: 24, borderBottomRightRadius: 24, padding: "24px 32px 32px"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Voucher Code</div>
                  <div onClick={() => viewingClaim.voucherCode && handleCopyText(viewingClaim.voucherCode, "Code")} style={{
                    background: "#F9FAFB", padding: "16px 20px", borderRadius: 16, border: "2px dashed #E5E7EB",
                    display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
                    transition: "all 0.2s"
                  }}>
                    <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 900, color: "#111827", letterSpacing: "0.05em", wordBreak: "break-all" }}>{viewingClaim.voucherCode || "N/A"}</div>
                    <Copy size={20} color="#6B7280" />
                  </div>
                </div>

                {viewingClaim.hasPin && viewingClaim.voucherPin && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Security PIN</div>
                    <div onClick={() => viewingClaim.voucherPin && handleCopyText(viewingClaim.voucherPin, "PIN")} style={{
                      background: "#F9FAFB", padding: "16px 20px", borderRadius: 16, border: "2px dashed #E5E7EB",
                      display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
                      transition: "all 0.2s"
                    }}>
                      <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 900, color: "#111827", letterSpacing: "0.05em" }}>{viewingClaim.voucherPin}</div>
                      <Copy size={20} color="#6B7280" />
                    </div>
                  </div>
                )}
              </div>

              <NativeButton onClick={() => setViewingClaim(null)} style={{ marginTop: 32 }}>Done</NativeButton>
            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: translate(-50%, -45%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        * { -webkit-tap-highlight-color: transparent; }
      `}} />
    </div>
  );
}
