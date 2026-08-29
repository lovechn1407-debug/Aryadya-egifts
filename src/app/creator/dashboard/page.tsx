"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Creator, AffiliateMilestone, AffiliateReward, Payout, RewardClaim, RewardType } from "@/lib/db";
import type { Coupon } from "@/lib/data";
import {
  LayoutDashboard, Ticket, ShoppingBag, Banknote, UserCog,
  LogOut, ChevronDown, CheckCircle2, Clock, Copy, ArrowUpRight,
  ArrowDownRight, Loader2, Info, Gift, DollarSign, Target,
  ChevronUp
} from "lucide-react";

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

/* ── UI Components (Shadcn-inspired) ── */

function Card({ children, className = "", style }: any) {
  return <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)", ...style }} className={className}>{children}</div>
}

function CardHeader({ children, style, className = "" }: any) {
  return <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 6, ...style }} className={className}>{children}</div>
}

function CardTitle({ children, style }: any) {
  return <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", margin: 0, letterSpacing: "-0.01em", ...style }}>{children}</h3>
}

function CardContent({ children, style }: any) {
  return <div style={{ padding: "0 24px 24px", ...style }}>{children}</div>
}

function Badge({ children, variant = "default", style }: any) {
  const vStyles: any = {
    default: { background: "#F1F5F9", color: "#0F172A", border: "1px solid transparent" },
    outline: { background: "transparent", color: "#0F172A", border: "1px solid #E2E8F0" },
    success: { background: "#DCFCE7", color: "#166534", border: "1px solid transparent" },
    warning: { background: "#FEF3C7", color: "#92400E", border: "1px solid transparent" },
    primary: { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid transparent" },
    brand: { background: "#F3F4F6", color: "#0F172A", border: "1px solid transparent" }
  };
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", ...vStyles[variant], ...style }}>{children}</span>
}

function Button({ children, variant = "default", size = "default", style, ...props }: any) {
  const vStyles: any = {
    default: { background: "#0F172A", color: "#FFFFFF", border: "1px solid #0F172A" },
    outline: { background: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0" },
    secondary: { background: "#F1F5F9", color: "#0F172A", border: "1px solid transparent" },
    ghost: { background: "transparent", color: "#0F172A", border: "1px solid transparent" },
    primary: { background: "#2563EB", color: "#FFFFFF", border: "1px solid #2563EB" },
  };
  const sStyles: any = {
    default: { padding: "8px 16px", fontSize: 14, height: 40 },
    sm: { padding: "6px 12px", fontSize: 12, height: 32 },
    icon: { padding: 8, height: 36, width: 36, justifyContent: "center" }
  };
  return (
    <button
      style={{
        borderRadius: 8, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8,
        cursor: props.disabled ? "not-allowed" : "pointer", opacity: props.disabled ? 0.6 : 1,
        transition: "all 0.2s", justifyContent: "center",
        ...vStyles[variant], ...sStyles[size], ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ style, ...props }: any) {
  return (
    <input
      style={{
        width: "100%", height: 40, padding: "8px 12px", borderRadius: 8, border: "1px solid #E2E8F0",
        background: "#FFFFFF", color: "#0F172A", fontSize: 14, outline: "none", transition: "border-color 0.2s",
        ...style
      }}
      {...props}
    />
  );
}

function Label({ children, style }: any) {
  return <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#0F172A", marginBottom: 6, ...style }}>{children}</label>
}

/* ── Icons & Helpers ── */

function RewardIcon({ type, size = 20 }: { type?: RewardType, size?: number }) {
  if (type === "amazon") return <img src="/icons/amazon.png" alt="Amazon" style={{ width: size, height: size, objectFit: "contain", borderRadius: 4 }} />;
  if (type === "flipkart") return <img src="/icons/flipkart.png" alt="Flipkart" style={{ width: size, height: size, objectFit: "contain", borderRadius: 4 }} />;
  if (type === "myntra") return <img src="/icons/myntra.png" alt="Myntra" style={{ width: size, height: size, objectFit: "contain", borderRadius: 4 }} />;
  if (type === "cash") return <DollarSign size={size} color="#16A34A" />;
  return <Gift size={size} color="#64748B" />;
}

function ToastNotification({ toast, onClose }: { toast: { message: string; type: "success" | "error" | "info" } | null; onClose: () => void }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div style={{
      position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 99999,
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8,
      background: "#FFFFFF", color: "#0F172A", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
      border: `1px solid ${isSuccess ? "#86EFAC" : isError ? "#FCA5A5" : "#E2E8F0"}`,
      minWidth: 320, maxWidth: "90vw"
    }}>
      <div style={{ color: isSuccess ? "#16A34A" : isError ? "#DC2626" : "#2563EB" }}>
        {isSuccess ? <CheckCircle2 size={18} /> : isError ? <Info size={18} /> : <Info size={18} />}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{toast.message}</div>
    </div>
  );
}

/* ── Custom Cards ── */

function StatCard({ title, value, delta, positive, subtitle, icon: Icon }: any) {
  return (
    <Card>
      <CardHeader style={{ paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <CardTitle style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>{title}</CardTitle>
        {Icon && <Icon size={16} color="#94A3B8" />}
      </CardHeader>
      <CardContent>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{value}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          {delta && (
            <span style={{ display: "flex", alignItems: "center", color: positive ? "#16A34A" : "#DC2626", fontWeight: 500 }}>
              {positive ? <ArrowUpRight size={14} style={{ marginRight: 2 }} /> : <ArrowDownRight size={14} style={{ marginRight: 2 }} />}
              {delta}
            </span>
          )}
          <span style={{ color: "#64748B" }}>{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function MissionCard({
  reward,
  currentSales,
  claim,
  onClaim,
  onShowCode,
  claimingId,
  onCopyText,
}: {
  reward: AffiliateReward;
  currentSales: number;
  claim?: RewardClaim;
  onClaim: (rewardId: string) => void;
  onShowCode: (claim: RewardClaim) => void;
  claimingId: string | null;
  onCopyText: (text: string, label: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const unlocked = currentSales >= reward.referrals;
  const ratio = Math.min(100, Math.round((currentSales / reward.referrals) * 100));
  const isPending = claim && claim.status === "pending";
  const isFulfilled = claim && claim.status === "fulfilled";

  return (
    <Card style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
              <RewardIcon type={reward.rewardType} size={24} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>{fmt(reward.rewardAmountPaise)}</div>
              <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginTop: 2 }}>
                {reward.rewardType || "Mission"} Reward
              </div>
            </div>
          </div>
          <Badge variant={isFulfilled ? "success" : isPending ? "warning" : unlocked ? "primary" : "default"}>
            {isFulfilled ? "Delivered" : isPending ? "Reviewing" : unlocked ? "Unlocked" : `${ratio}%`}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 500, color: "#64748B" }}>
            <span>{currentSales} / {reward.referrals} Sales</span>
            <span>{ratio}%</span>
          </div>
          <div style={{ height: 6, background: "#F1F5F9", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${ratio}%`, borderRadius: 9999, transition: "width 0.5s ease",
              background: isFulfilled ? "#16A34A" : isPending ? "#D97706" : "#2563EB"
            }} />
          </div>
        </div>
        
        {/* Expand Toggle Hint */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: -8 }}>
           {expanded ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16, borderTop: "1px solid #F1F5F9", paddingTop: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>{reward.label}</div>
            <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.5 }}>
              {reward.description || `Complete ${reward.referrals} successful referrals to claim your reward.`}
            </div>
          </div>

          <div style={{ background: "#F8FAFC", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#64748B" }}>Amount</span>
              <span style={{ fontWeight: 600, color: "#0F172A" }}>{fmt(reward.rewardAmountPaise)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#64748B" }}>Target</span>
              <span style={{ fontWeight: 600, color: "#0F172A" }}>{reward.referrals} Sales</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#64748B" }}>Verification</span>
              <span style={{ fontWeight: 600, color: "#0F172A" }}>24 Hours SLA</span>
            </div>
          </div>

          {/* Action Area */}
          {isFulfilled ? (
            reward.rewardType === "cash" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ padding: "10px", borderRadius: 8, background: "#DCFCE7", color: "#166534", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={16} /> Cash credited successfully.
                </div>
                {claim?.utr && (
                  <Button variant="outline" size="sm" onClick={() => onCopyText(claim.utr!, "UTR Number")} style={{ width: "100%" }}>
                    <Copy size={14} /> Copy UTR: {claim.utr}
                  </Button>
                )}
              </div>
            ) : (
              <Button variant="primary" onClick={() => onShowCode(claim!)} style={{ width: "100%" }}>
                <Ticket size={16} /> Show Voucher Code
              </Button>
            )
          ) : isPending ? (
            <div style={{ padding: "10px", borderRadius: 8, background: "#FEF3C7", color: "#92400E", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={16} /> Processing claim (Wait 24h)
            </div>
          ) : (
            <Button
              variant={unlocked ? "primary" : "secondary"}
              disabled={!unlocked || claimingId === reward.id}
              onClick={() => onClaim(reward.id)}
              style={{ width: "100%" }}
            >
              {claimingId === reward.id ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
              ) : unlocked ? (
                <><Gift size={16} /> Claim Reward</>
              ) : (
                <><Target size={16} /> {reward.referrals - currentSales} More Sales Needed</>
              )}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

/* ── Main Page ── */

export default function CreatorDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "coupons" | "orders" | "payouts" | "settings">("overview");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [settingsForm, setSettingsForm] = useState({ name: "", phone: "", instagram: "", youtube: "", other: "", upiId: "", upiName: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [viewingClaim, setViewingClaim] = useState<RewardClaim | null>(null);

  const fetchData = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/creator/me?uid=${userId}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        setSettingsForm({
          name: json.creator.name || "",
          phone: json.creator.phone || "",
          instagram: json.creator.instagramHandle || "",
          youtube: json.creator.youtubeHandle || "",
          other: json.creator.otherHandle || "",
          upiId: json.creator.upiId || "",
          upiName: json.creator.upiName || "",
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId, creatorId: data.creator.uid }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Claim successful. We will process this within 24 hours.", "success");
        await fetchData(data.creator.uid);
      } else {
        showToast(json.message || "Failed to claim reward.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setClaimingRewardId(null);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard`, "success");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/creator/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: data.creator.uid,
          email: data.creator.email,
          name: settingsForm.name,
          phone: settingsForm.phone,
          instagramHandle: settingsForm.instagram,
          youtubeHandle: settingsForm.youtube,
          otherHandle: settingsForm.other,
          upiId: settingsForm.upiId,
          upiName: settingsForm.upiName,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Settings updated successfully.", "success");
        await fetchData(data.creator.uid);
      } else {
        showToast(json.message || "Failed to update settings.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#64748B" }}>
          <Loader2 size={32} className="animate-spin" />
          <div style={{ fontSize: 14, fontWeight: 500 }}>Loading Portal...</div>
        </div>
      </div>
    );
  }

  const { creator, coupons, orders, payouts, rewards, rewardClaims, monthlyEarnings, pendingPayoutPaise } = data;
  const paidOrders = orders.filter(o => o.status === "PAID");
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthEarnings = monthlyEarnings[thisMonth] || 0;

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "orders", label: "Sales", icon: ShoppingBag },
    { id: "payouts", label: "Payouts", icon: Banknote },
    { id: "settings", label: "Settings", icon: UserCog },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "Inter, system-ui, sans-serif", color: "#0F172A", paddingBottom: 80 }}>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50, background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid #E2E8F0", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 9999, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F172A", fontWeight: 600, border: "1px solid #E2E8F0" }}>
            {creator.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{creator.name}</h1>
            <div style={{ fontSize: 13, color: "#64748B" }}>Partner Portal</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={async () => { await auth.signOut(); router.push("/creator"); }}>
          <LogOut size={20} color="#64748B" />
        </Button>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
        
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <StatCard title="Total Earnings" value={fmt(creator.totalEarningsPaise)} delta="Active" positive={true} subtitle="All time" icon={Banknote} />
              <StatCard title="This Month" value={fmt(thisMonthEarnings)} subtitle="Calculated real-time" icon={LayoutDashboard} />
              <StatCard title="Unpaid Balance" value={fmt(pendingPayoutPaise)} delta="Pending" positive={false} subtitle="Direct UPI transfer" icon={DollarSign} />
              <StatCard title="Total Sales" value={`${creator.totalReferrals}`} subtitle="Successful orders" icon={ShoppingBag} />
            </div>

            {/* Static Bonus Commission Milestone */}
            <Card style={{ background: "#F8FAFC", border: "1px dashed #CBD5E1" }}>
              <CardContent style={{ padding: "24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #E2E8F0" }}>
                  <Target size={24} color="#2563EB" />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: "#0F172A" }}>Bonus Commission Milestone</h4>
                  <p style={{ margin: 0, fontSize: 14, color: "#64748B" }}>Reach 100 overall sales to unlock an additional 5% commission on all future orders.</p>
                </div>
                <Badge variant="primary" style={{ padding: "6px 12px", fontSize: 13 }}>Coming Soon</Badge>
              </CardContent>
            </Card>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#0F172A" }}>Reward Missions</h2>
              {!rewards.length ? (
                <Card><CardContent style={{ padding: 40, textAlign: "center", color: "#64748B" }}>No missions available right now.</CardContent></Card>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                  {rewards.map(r => (
                    <MissionCard
                      key={r.id} reward={r} currentSales={creator.totalReferrals}
                      claim={rewardClaims.find(c => c.rewardId === r.id)}
                      onClaim={handleClaimReward} onShowCode={setViewingClaim}
                      claimingId={claimingRewardId} onCopyText={handleCopyText}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* COUPONS */}
        {activeTab === "coupons" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>My Coupons</h2>
            {!coupons.length ? (
              <Card><CardContent style={{ padding: 40, textAlign: "center", color: "#64748B" }}>No coupons assigned yet.</CardContent></Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {coupons.map(c => (
                  <Card key={c.id}>
                    <CardContent style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "1px", color: "#0F172A" }}>{c.id}</span>
                          <Badge variant={c.active ? "success" : "default"}>{c.active ? "Active" : "Inactive"}</Badge>
                        </div>
                        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#64748B" }}>
                          <span>Discount: <strong style={{ color: "#0F172A" }}>{c.discountType === "percentage" ? `${c.discountAmount}%` : fmt(c.discountAmount * 100)}</strong></span>
                          <span>Commission: <strong style={{ color: "#0F172A" }}>{c.commissionPercentage}%</strong></span>
                          <span>Uses: <strong style={{ color: "#0F172A" }}>{c.usedCount}</strong></span>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => handleCopyText(c.id, "Coupon Code")}>
                        <Copy size={16} /> Copy Code
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Referred Sales</h2>
            <Card style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E2E8F0", background: "#F8FAFC", textAlign: "left", color: "#64748B" }}>
                      <th style={{ padding: "16px 24px", fontWeight: 500 }}>Order ID</th>
                      <th style={{ padding: "16px 24px", fontWeight: 500 }}>Product</th>
                      <th style={{ padding: "16px 24px", fontWeight: 500 }}>Amount</th>
                      <th style={{ padding: "16px 24px", fontWeight: 500 }}>Commission</th>
                      <th style={{ padding: "16px 24px", fontWeight: 500 }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!paidOrders.length ? (
                      <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#64748B" }}>No referred orders yet.</td></tr>
                    ) : (
                      paidOrders.map(o => (
                        <tr key={o.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "16px 24px", fontFamily: "monospace", color: "#64748B" }}>{o.id}</td>
                          <td style={{ padding: "16px 24px", fontWeight: 500 }}>{o.productName}</td>
                          <td style={{ padding: "16px 24px", color: "#64748B" }}>{fmt(o.amount)}</td>
                          <td style={{ padding: "16px 24px", fontWeight: 600, color: "#16A34A" }}>{fmt(o.commissionAmount)}</td>
                          <td style={{ padding: "16px 24px", color: "#64748B" }}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* PAYOUTS */}
        {activeTab === "payouts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Payout History</h2>
            <Card style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E2E8F0", background: "#F8FAFC", textAlign: "left", color: "#64748B" }}>
                      <th style={{ padding: "16px 24px", fontWeight: 500 }}>Payout ID</th>
                      <th style={{ padding: "16px 24px", fontWeight: 500 }}>Amount</th>
                      <th style={{ padding: "16px 24px", fontWeight: 500 }}>Status</th>
                      <th style={{ padding: "16px 24px", fontWeight: 500 }}>Reference</th>
                      <th style={{ padding: "16px 24px", fontWeight: 500 }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!payouts.length ? (
                      <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#64748B" }}>No payouts recorded yet.</td></tr>
                    ) : (
                      payouts.map(p => (
                        <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "16px 24px", fontFamily: "monospace", color: "#64748B" }}>{p.id}</td>
                          <td style={{ padding: "16px 24px", fontWeight: 600 }}>{fmt(p.amountPaise)}</td>
                          <td style={{ padding: "16px 24px" }}>
                            <Badge variant={p.status === "paid" ? "success" : "warning"}>{p.status}</Badge>
                          </td>
                          <td style={{ padding: "16px 24px", fontFamily: "monospace", color: "#64748B" }}>{p.reference || "N/A"}</td>
                          <td style={{ padding: "16px 24px", color: "#64748B" }}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 600 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Account Settings</h2>
            <Card>
              <CardContent style={{ padding: "24px 32px" }}>
                <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <Label>Full Name</Label>
                    <Input value={settingsForm.name} onChange={(e: any) => setSettingsForm({ ...settingsForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={settingsForm.phone} onChange={(e: any) => setSettingsForm({ ...settingsForm, phone: e.target.value })} />
                  </div>
                  <div style={{ borderTop: "1px solid #E2E8F0", margin: "8px 0" }} />
                  <div>
                    <Label>UPI ID (For Payouts)</Label>
                    <Input value={settingsForm.upiId} onChange={(e: any) => setSettingsForm({ ...settingsForm, upiId: e.target.value })} placeholder="username@upi" />
                  </div>
                  <div>
                    <Label>Account Holder Name (UPI)</Label>
                    <Input value={settingsForm.upiName} onChange={(e: any) => setSettingsForm({ ...settingsForm, upiName: e.target.value })} />
                  </div>
                  <Button type="submit" disabled={settingsSaving} style={{ marginTop: 8 }}>
                    {settingsSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </main>

      {/* Floating Bottom Navigation */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)",
        borderTop: "1px solid #E2E8F0", paddingBottom: "env(safe-area-inset-bottom)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: 64, maxWidth: 600, margin: "0 auto", padding: "0 8px" }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                  height: "100%", background: "transparent", border: "none", cursor: "pointer",
                  color: isActive ? "#0F172A" : "#94A3B8", transition: "color 0.2s"
                }}
              >
                <Icon size={24} style={{ strokeWidth: isActive ? 2.5 : 2 }} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Voucher Modal */}
      {viewingClaim && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }}>
          <Card style={{ width: "100%", maxWidth: 400, overflow: "hidden", animation: "modalIn 0.2s ease-out" }}>
            <CardHeader style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", alignItems: "center", padding: "32px 24px 24px" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #E2E8F0", marginBottom: 16, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                <RewardIcon type={viewingClaim.rewardType} size={32} />
              </div>
              <CardTitle style={{ fontSize: 20 }}>{viewingClaim.rewardLabel}</CardTitle>
              <div style={{ fontSize: 14, color: "#64748B", textAlign: "center", marginTop: 8 }}>Your voucher has been verified and issued.</div>
            </CardHeader>
            <CardContent style={{ padding: 32 }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Voucher Code</div>
                  <div style={{ padding: "16px", background: "#F1F5F9", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: "#0F172A", wordBreak: "break-all" }}>{viewingClaim.voucherCode || "N/A"}</span>
                    <Button variant="ghost" size="icon" onClick={() => viewingClaim.voucherCode && handleCopyText(viewingClaim.voucherCode, "Voucher Code")}>
                      <Copy size={18} />
                    </Button>
                  </div>
                </div>

                {viewingClaim.hasPin && viewingClaim.voucherPin && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Voucher PIN</div>
                    <div style={{ padding: "16px", background: "#F1F5F9", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: "#0F172A", wordBreak: "break-all" }}>{viewingClaim.voucherPin}</span>
                      <Button variant="ghost" size="icon" onClick={() => viewingClaim.voucherPin && handleCopyText(viewingClaim.voucherPin, "Voucher PIN")}>
                        <Copy size={18} />
                      </Button>
                    </div>
                  </div>
                )}

                <Button variant="outline" onClick={() => setViewingClaim(null)} style={{ width: "100%", marginTop: 8 }}>
                  Close
                </Button>
              </div>

            </CardContent>
          </Card>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          ` }} />
        </div>
      )}

    </div>
  );
}
