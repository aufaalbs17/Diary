import { Suspense } from "react";
import { MemoryForm } from "@/components/diary/memory-form";

export const metadata = {
  title: "Tambah Cerita Baru | Our Little Moments 🤍",
  description: "Tulis cerita kecil yang ingin kita simpan selamanya.",
};

export default function NewMemoryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-[#8D817B]">
          Menyiapkan formulir kenangan...
        </div>
      }
    >
      <MemoryForm />
    </Suspense>
  );
}
