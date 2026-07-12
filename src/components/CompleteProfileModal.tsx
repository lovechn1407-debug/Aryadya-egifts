"use client";
import React, { useState, useEffect } from "react";
import { saveUserProfileDB } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";

export default function CompleteProfileModal({ onClose }: { onClose: () => void }) {
  const { user, userProfile, refreshProfile } = useAuth();
  
  const needsName = user ? (!userProfile?.name && !user.displayName) : false;
  const needsEmail = user ? (!userProfile?.email && !user.email) : false;
  const needsPhone = user ? (!userProfile?.phone && !user.phoneNumber) : false;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (userProfile?.name || user.displayName) setName(userProfile?.name || user.displayName || "");
      if (userProfile?.email || user.email) setEmail(userProfile?.email || user.email || "");
      if (userProfile?.phone || user.phoneNumber) setPhone(userProfile?.phone || user.phoneNumber || "");
    }
  }, [user, userProfile]);

  if (!user) return null;
  
  // If we already have everything, don't show the modal
  if (!needsName && !needsEmail && !needsPhone) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveUserProfileDB(user.uid, { 
        name: name.trim(), 
        email: email.trim(), 
        phone: phone.trim() 
      });
      await refreshProfile();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 400,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)", position: "relative"
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1E293B", textAlign: "center", marginBottom: 8 }}>
          Complete Your Profile
        </h2>
        <p style={{ fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 24 }}>
          Please provide your missing details. These are required for order tracking and invoices.
        </p>

        <form onSubmit={handleSubmit}>
          {needsName && (
            <>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="John Doe" 
                required 
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, marginBottom: 16, boxSizing: "border-box" }} 
              />
            </>
          )}

          {needsEmail && (
            <>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="john@example.com" 
                required 
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, marginBottom: 16, boxSizing: "border-box" }} 
              />
            </>
          )}

          {needsPhone && (
            <>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Phone Number (10 digits)</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="9876543210" 
                required 
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, marginBottom: 24, boxSizing: "border-box" }} 
              />
            </>
          )}

          <button type="submit" disabled={isSubmitting} style={{
            background: "#10B981", color: "#fff", border: "none", borderRadius: 10, padding: "14px",
            fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", opacity: isSubmitting ? 0.7 : 1, marginTop: needsPhone ? 0 : 8
          }}>
            {isSubmitting ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
