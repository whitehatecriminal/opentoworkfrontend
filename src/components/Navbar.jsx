"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  const isLinkActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF7F2]/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* 1. LEFT: Brand Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="font-[family-name:var(--font-playfair)] text-2xl sm:text-[27px] font-bold tracking-tight text-[#0f172a] hover:opacity-90 transition-opacity no-underline"
            >
              Open To Work
            </Link>
          </div>

          {/* 2. MIDDLE: Rounded Pill Navbar (Desktop) */}
          <nav className="hidden md:flex items-center py-1 px-1 bg-[#F4EFE6]/90 border border-[#E5DDD0]/80 rounded-full shadow-xs">
            <div className="flex items-center gap-4 lg:gap-8">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-6 py-2.5 text-sm sm:text-[14.5px] font-medium rounded-full transition-all duration-200 no-underline ${
                      isActive
                        ? "bg-white text-slate-950 shadow-xs border border-[#E5DDD0]/60 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* 3. RIGHT: Login & 'Get early access' Button (Desktop) */}
          <div className="hidden md:flex items-center gap-5 sm:gap-6">
            <Link
              href="/login"
              className="text-[14.5px] font-medium text-slate-700 hover:text-slate-950 transition-colors no-underline"
            >
              Login
            </Link>

            {/* Signature Dual-Segment Button */}
            <Link
              href="/signup"
              className="group inline-flex items-center rounded-xl bg-[#1e2329] p-1 shadow-sm hover:shadow-md hover:bg-slate-900 active:scale-[0.98] transition-all no-underline border border-slate-800"
            >
              <span className="px-3.5 py-1.5 text-[13.5px] font-medium text-white tracking-tight">
                Sign up
              </span>
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-xs group-hover:from-[#fb923c] group-hover:to-[#ea580c] transition-all">
                <svg
                  className="w-3.5 h-3.5 text-white transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7V15" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EAE3D7] bg-[#FAF7F2]/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                    isActive
                      ? "bg-[#EDE6DA] text-slate-950 font-semibold"
                      : "text-slate-600 hover:bg-[#F4EFE6] hover:text-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2 border-t border-[#EAE3D7]">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-slate-700 hover:bg-[#F4EFE6] rounded-xl transition-colors no-underline"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors no-underline"
            >
              <span>Get started</span>
              <span className="flex items-center justify-center w-5 h-5 rounded bg-orange-500">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H9M17 7V15" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}