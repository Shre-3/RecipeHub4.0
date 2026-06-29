import React from "react";

export function PageLayout({ children, className = "bg-[#f4f1e7]" }) {
  return (
    <main className={`w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
    </main>
  );
}
