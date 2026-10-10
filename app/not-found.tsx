import Link from "next/link";
import Navbar from "@/src/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-lg text-center">
          {/* 404 Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-50 border border-orange-100 text-[#EA580C] mb-6 shadow-xs">
            <span className="text-3xl font-black font-[family-name:var(--font-playfair)]">
              404
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)] mb-3">
            Page Not Found
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-stone-500 font-[family-name:var(--font-jakarta)] max-w-md mx-auto mb-8">
            The page you are looking for doesn’t exist or has been moved. Please check the URL or return back.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#1e2329] hover:bg-slate-900 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 no-underline"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-[#E5DDD0] bg-white hover:bg-[#FAF7F2] text-[#1C1917] font-semibold text-sm shadow-xs transition-all duration-200 no-underline"
            >
              <span>Go to Dashboard</span>
              <svg
                className="w-4 h-4 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
