"use client";

import React from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        transform: "translate3d(0, 0, 0)",
        backfaceVisibility: "hidden",
        willChange: "transform, opacity",
      }}
      className="w-full h-full flex-1"
    >
      {children}
    </motion.div>

  );
}
