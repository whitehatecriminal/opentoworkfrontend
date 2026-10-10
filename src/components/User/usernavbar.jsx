"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, logout } from "@/src/store/authstore";
import { logoutUser } from "@/src/config/providers";

export default function UserNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Applications", href: "/my-applications" },
    { name: "Explore Work", href: "/explorework" },
  ];

  const isLinkActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser?.();
    } catch {
      // ignore firebase signout error if any
    }
    logout();
    router.push("/login");
  };

  // User details
  const userPhoto = user?.profileImage || null;
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userInitial = (userName?.[0] || userEmail?.[0] || "U").toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E5DDD0]/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">

          {/* 1. LEFT: Brand Logo (Links to Dashboard) */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="font-[family-name:var(--font-playfair)] text-2xl sm:text-[27px] font-bold tracking-tight text-[#0f172a] hover:opacity-90 transition-opacity no-underline"
            >
              Open To Work
            </Link>
          </div>

          {/* 2. MIDDLE: Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center py-1 px-1 bg-[#F4EFE6]/90 border border-[#E5DDD0]/80 rounded-full shadow-xs">
            <div className="flex items-center gap-2 lg:gap-4">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 no-underline ${isActive
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

          {/* 3. RIGHT: Post Work Button & Profile Dropdown (Desktop) */}
          <div className="hidden md:flex items-center gap-4 lg:gap-5">
            {/* Post Work Option */}
            <Link
              href="/post-work"
              className="group inline-flex items-center rounded-xl bg-[#1e2329] p-1 shadow-sm hover:shadow-md hover:bg-slate-900 active:scale-[0.98] transition-all no-underline border border-slate-800"
            >
              <span className="px-3.5 py-1.5 text-[13.5px] font-medium text-white tracking-tight">
                Post Work
              </span>
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-xs group-hover:from-[#fb923c] group-hover:to-[#ea580c] transition-all">
                <svg
                  className="w-3.5 h-3.5 text-white transform group-hover:rotate-45 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </Link>

            {/* Profile with 50% round (rounded-full) + Hover/Click Dropdown */}
            <div
              className="relative group"
              ref={dropdownRef}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[#F4EFE6] transition-colors focus:outline-none cursor-pointer"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {/* 50% Rounded User Image / Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 shadow-xs flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-600 text-white font-semibold text-sm">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={userName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>

                {/* Small Dropdown Arrow */}
                <svg
                  className={`w-4 h-4 text-stone-600 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-orange-600" : "group-hover:translate-y-0.5"
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#E5DDD0] shadow-xl py-2 z-50 transition-all duration-200 transform origin-top-right ${dropdownOpen
                    ? "opacity-100 scale-100 visible"
                    : "opacity-0 scale-95 invisible pointer-events-none"
                  }`}
              >
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-[#E5DDD0]/60">
                  <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-semibold text-stone-800 truncate">{userName}</p>
                  {userEmail && (
                    <p className="text-xs text-stone-500 truncate">{userEmail}</p>
                  )}
                </div>

                {/* Settings Link */}
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-[#FAF7F2] hover:text-orange-600 transition-colors no-underline"
                >
                  <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </Link>

                {/* Logout Option */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer border-t border-[#E5DDD0]/50 mt-1"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. MOBILE: Hamburger Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            {/* Mobile Profile Thumbnail */}
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-orange-500 shadow-xs flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-600 text-white font-semibold text-xs">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={userName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-[#F4EFE6] focus:outline-none transition-colors"
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
        <div className="md:hidden border-b border-[#EAE3D7] bg-[#FAF7F2]/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {/* User Info on Mobile */}
          <div className="px-3 py-2 bg-[#F4EFE6] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500 flex items-center justify-center bg-orange-500 text-white font-bold text-sm">
              {userPhoto ? (
                <img src={userPhoto} alt={userName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-800 truncate">{userName}</p>
              {userEmail && <p className="text-xs text-stone-500 truncate">{userEmail}</p>}
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors no-underline ${isActive
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
              href="/post-work"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors no-underline"
            >
              <span>Post Work</span>
              <span className="flex items-center justify-center w-5 h-5 rounded bg-orange-500">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-stone-700 hover:bg-[#F4EFE6] rounded-xl transition-colors no-underline"
            >
              Settings
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}