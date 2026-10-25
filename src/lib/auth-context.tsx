"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Profile, Space, SpaceMember } from "./types";
import {
  getActiveUser,
  getAuthSession,
  getSpace,
  joinSpaceByInviteCode,
  saveSpace,
  setActiveUser as setStoreActiveUser,
  setAuthSession,
  updateUserProfile as storeUpdateUserProfile,
  verifyCredentials,
} from "./store";
import { createClient, isSupabaseConfigured } from "./supabase/client";

interface AuthContextType {
  user: Profile | null;
  space: Space | null;
  partner: Profile | null;
  allMembers: SpaceMember[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfiguredWithSupabase: boolean;
  login: (
    identifier: string,
    pin: string
  ) => Promise<{ success: boolean; message: string; user?: Profile }>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  updateProfile: (
    profile: Partial<Profile>,
    targetUserId?: string
  ) => Promise<{ success: boolean; message: string }>;
  updateSpaceName: (name: string) => void;
  joinSpace: (code: string) => { success: boolean; message: string };
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const reloadData = useCallback(() => {
    try {
      const currentSpace = getSpace();
      const session = getAuthSession();
      const isLoggedOut =
        typeof window !== "undefined" &&
        localStorage.getItem("olm_logged_out") === "true";

      const hasValidSession = Boolean(session?.userId) && !isLoggedOut;
      setIsAuthenticated(hasValidSession);

      const currentUser = hasValidSession ? getActiveUser() : null;
      setSpace(currentSpace);
      setUser(currentUser);

      const partnerMember = currentSpace.members.find(
        (m) => m.user_id !== currentUser?.id
      );
      setPartner(partnerMember?.profile || null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();

    const handleUserChanged = () => reloadData();
    const handleAuthChanged = () => reloadData();

    window.addEventListener("olm_user_changed", handleUserChanged);
    window.addEventListener("olm_auth_changed", handleAuthChanged);
    return () => {
      window.removeEventListener("olm_user_changed", handleUserChanged);
      window.removeEventListener("olm_auth_changed", handleAuthChanged);
    };
  }, [reloadData]);

  const login = async (
    identifier: string,
    pin: string
  ): Promise<{ success: boolean; message: string; user?: Profile }> => {
    try {
      // 1. Try server API login
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, pin }),
        });
        const data = await response.json();
        if (response.ok && data.success && data.user) {
          setAuthSession({
            userId: data.user.id,
            loggedInAt: new Date().toISOString(),
          });
          reloadData();
          return {
            success: true,
            message: data.message || `Selamat datang kembali, ${data.user.nickname}! ♡`,
            user: data.user,
          };
        }
      } catch (apiErr) {
        console.warn("Backend API not reachable, falling back to local credentials verify:", apiErr);
      }

      // 2. Client fallback verification
      const verifyResult = verifyCredentials(identifier, pin);
      if (verifyResult.success && verifyResult.user) {
        setAuthSession({
          userId: verifyResult.user.id,
          loggedInAt: new Date().toISOString(),
        });
        reloadData();
        return {
          success: true,
          message: verifyResult.message,
          user: verifyResult.user,
        };
      }

      return {
        success: false,
        message: verifyResult.message || "Identitas atau PIN tidak cocok.",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Terjadi kesalahan saat masuk.",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          await supabase.auth.signOut();
        }
      }
    } finally {
      setAuthSession(null);
      setIsAuthenticated(false);
      reloadData();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const switchUser = (userId: string) => {
    setStoreActiveUser(userId);
    reloadData();
  };

  // STRICT RULE: Can only update profile for currently logged-in account
  const updateProfile = async (
    updated: Partial<Profile>,
    targetUserId?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: "Silakan login terlebih dahulu." };
    }

    const requestedId = targetUserId || user.id;

    // Strict boundary check: If attempting to modify partner or another account, reject immediately!
    if (requestedId !== user.id) {
      return {
        success: false,
        message: "Kamu hanya dapat mengubah pengaturan profil milik akunmu sendiri.",
      };
    }

    // Call server API route with strict authorization
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          targetUserId: user.id,
          data: updated,
        }),
      });
    } catch (e) {
      console.warn("Failed to sync profile with server API, applying local store:", e);
    }

    // Update local space store
    storeUpdateUserProfile(user.id, updated);
    reloadData();

    return { success: true, message: "Profil akun berhasil diperbarui! ✨" };
  };

  const updateSpaceName = (name: string) => {
    if (!space) return;
    const updatedSpace = { ...space, name };
    saveSpace(updatedSpace);
    reloadData();
  };

  const joinSpace = (code: string) => {
    if (!user) return { success: false, message: "Pengguna tidak aktif" };
    const result = joinSpaceByInviteCode(code, user);
    if (result.success) {
      reloadData();
    }
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        space,
        partner,
        allMembers: space?.members || [],
        isAuthenticated,
        isLoading,
        isConfiguredWithSupabase: isSupabaseConfigured,
        login,
        logout,
        switchUser,
        updateProfile,
        updateSpaceName,
        joinSpace,
        refresh: reloadData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
