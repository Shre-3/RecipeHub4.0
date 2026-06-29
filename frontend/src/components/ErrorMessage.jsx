import React from "react";
import { Clock, SearchX } from "lucide-react";

export function ErrorMessage({ message, compact = false }) {
  const isRateLimit = message?.toLowerCase().includes("rate limit");

  if (isRateLimit) {
    return (
      <div
        role="alert"
        className={`flex flex-col items-center gap-3 w-full text-center rounded-xl bg-gradient-to-br from-amber-50 via-[#f0e4cc]/50 to-amber-50/80 border border-amber-300/40 shadow-md ${
          compact ? "p-4" : "p-6 max-w-sm"
        }`}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 ring-4 ring-amber-100/50">
          <Clock className="w-5 h-5 text-amber-700" />
        </div>
        <p className="text-sm font-semibold text-amber-900 leading-relaxed">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 w-full text-center rounded-xl bg-gradient-to-br from-[#1f5129]/10 via-[#f0e4cc]/60 to-[#1f5129]/5 border border-[#1f5129]/20 shadow-md ${
        compact ? "p-4" : "p-6 max-w-sm"
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f5129]/15 ring-4 ring-[#1f5129]/5">
        <SearchX className="w-5 h-5 text-[#1f5129]" />
      </div>
      <p className="text-sm font-semibold text-[#1f5129] leading-relaxed">
        {message}
      </p>
    </div>
  );
}
