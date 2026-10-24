"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Profile, Space, SpaceMember } from "./types";
import {
  getActiveUser,
  getSpace,
  joinSpaceByInviteCode,
  saveSpace,
  setActiveUser as setStoreActiveUser,
} from "./store";
import { createClient, isSupabaseConfigured } from "./supabase/client";

interface AuthContextType {
  user: Profile | null;
  space: Space | null;
  partner: Profile | null;
  allMembers: SpaceMember[];
  isConfiguredWithSupabase: boolean;
  switchUser: (userId: string) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  updateSpaceName: (name: string) => void;
  joinSpace: (code: string) => { success: boolean; message: string };
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);

  const reloadData = () => {
    const currentSpace = getSpace();
    const currentUser = getActiveUser();
    setSpace(currentSpace);
    setUser(currentUser);

    const partnerMember = currentSpace.members.find(
      (m) => m.user_id !== currentUser.id
    );
    setPartner(partnerMember?.profile || null);
  };

  useEffect(() => {
    reloadData();

    const handleUserChanged = () => {
      reloadData();
    };

    window.addEventListener("olm_user_changed", handleUserChanged);
    return () => {
      window.removeEventListener("olm_user_changed", handleUserChanged);
    };
  }, []);

  const switchUser = (userId: string) => {
    setStoreActiveUser(userId);
    reloadData();
  };

  const updateProfile = (updated: Partial<Profile>) => {
    if (!user || !space) return;
    const newProfile = { ...user, ...updated };
    const updatedMembers = space.members.map((m) =>
      m.user_id === user.id ? { ...m, profile: newProfile } : m
    );
    const updatedSpace = { ...space, members: updatedMembers };
    saveSpace(updatedSpace);
    reloadData();
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

  const logout = async () => {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    // In local mode, redirect to welcome page
    window.location.href = "/welcome";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        space,
        partner,
        allMembers: space?.members || [],
        isConfiguredWithSupabase: isSupabaseConfigured,
        switchUser,
        updateProfile,
        updateSpaceName,
        joinSpace,
        logout,
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
