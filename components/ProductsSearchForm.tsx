"use client";

import React, { useState } from "react";

export default function ProductsSearchForm({
  defaultValue = "",
  activeCategoryId, // "all" أو id
  onSearch, // (search, categoryIdOrNull) => void
  loading,
}: {
  defaultValue?: string;
  activeCategoryId: string; // "all" | categoryId
  onSearch: (search: string, categoryId?: string) => void;
  loading?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const search = value.trim();
    if (!search) return; // ✅ ممنوع إرسال إذا فاضي/فراغ

    // ✅ إذا all لا تبعت category
    const category =
      activeCategoryId && activeCategoryId !== "all"
        ? activeCategoryId
        : undefined;

    onSearch(search, category);
  }

  return (
    <form className="flex w-full max-w-md items-center gap-2" onSubmit={submit}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ابحث (مثلاً: ساتان، عباية، طقم...)"
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-brandGold/20 focus:ring-4"
      />

      <button
        type="submit"
        disabled={loading || !value.trim()}
        className={[
          "rounded-2xl px-4 py-3 text-sm font-semibold shadow-soft transition",
          loading || !value.trim()
            ? "bg-black/10 text-black/40 cursor-not-allowed"
            : "bg-brandGreen text-white hover:opacity-95",
        ].join(" ")}
      >
        بحث
      </button>
    </form>
  );
}
