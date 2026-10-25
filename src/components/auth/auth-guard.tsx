"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const PUBLIC_PATHS = ["/login", "/welcome"];

function AuthGuardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith("/api/")
  );

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublic) {
        // Redirect fresh visitors or unauthenticated sessions to /login
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, isPublic, router]);

  // Fast minimal loader while checking session on protected pages
  if (isLoading && !isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#CFA6A3] border-t-transparent rounded-full animate-spin" />
          <p className="font-editorial-body text-xs text-[#78655F] tracking-wide">
            Membuka Ruang Kenangan...
          </p>
        </div>
      </div>
    );
  }

  // Prevent flashing protected content before redirect
  if (!isAuthenticated && !isPublic) {
    return null;
  }

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthGuardContent>{children}</AuthGuardContent>
    </Suspense>
  );
}
