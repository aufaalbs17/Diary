"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Memory } from "@/lib/types";
import { getMemoryById } from "@/lib/store";
import { MemoryForm } from "@/components/diary/memory-form";

function EditMemoryContent() {
  const params = useParams();
  const memoryId = params?.id as string;
  const [memory, setMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!memoryId) return;
      const res = await getMemoryById(memoryId);
      setMemory(res.memory);
      setIsLoading(false);
    }
    load();
  }, [memoryId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#CFA6A3] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-editorial-body text-xs text-[#8D817B]">
          Memuat kenangan untuk diedit...
        </p>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-xs text-[#8D817B]">
        Kenangan tidak ditemukan.
      </div>
    );
  }

  return <MemoryForm initialData={memory} isEdit={true} />;
}

export default function EditMemoryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-[#8D817B]">
          Memuat halaman edit...
        </div>
      }
    >
      <EditMemoryContent />
    </Suspense>
  );
}
