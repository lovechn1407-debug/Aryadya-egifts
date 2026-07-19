"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfileDB, UserProfile } from "@/lib/db";
import CompleteProfileModal from "@/components/CompleteProfileModal";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const profile = await getUserProfileDB(uid);
      setUserProfile(profile);
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  useEffect(() => {
    // Handle redirect results to capture errors cleanly
    getRedirectResult(auth).catch((err) => {
      console.error("Google auth redirect error:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshProfile }}>
      {children}
      <CompleteProfileModal onClose={() => {}} />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
