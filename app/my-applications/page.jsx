"use client";

import { useSyncExternalStore, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import UserNavbar from "@/src/components/User/usernavbar";
import Navbar from "@/src/components/Navbar";
import { useAuthStore } from "@/src/store/authstore";
import MyCreatedApplication from "@/src/components/myapplication/mycreatedapplication";
import AppliedApplication from "@/src/components/myapplication/appliedapplication";
import { Briefcase, Send, Plus, Compass, ArrowRight, Sparkles, FileCheck2,
} from "lucide-react";

const emptySubscribe = () => () => {};

function MyApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const { isAuthenticated, token, user } = useAuthStore();

  // Tab state derived directly from URL searchParams ("my-created" by default)
  const urlTab = searchParams.get("tab");
  const activeTab =
    urlTab === "applied" || urlTab === "applied-application"
      ? "applied"
      : "my-created";

  // Handle Tab Switch and update URL search query smoothly
  const handleTabChange = (tabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabKey);
    router.replace(`/my-applications?${params.toString()}`, { scroll: false });
  };

  // Auth Protection: If user is not logged in, redirect to /login
  useEffect(() => {
    const state = useAuthStore.getState();
    const isUserLoggedIn = Boolean(state.isAuthenticated || state.token || state.user);
    if (!isUserLoggedIn) {
      router.push("/login");
    }
  }, [isAuthenticated, token, user, router]);

  // Loading spinner during hydration check
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* 1. Header Navigation Bar */}
      {isAuthenticated || token || user ? <UserNavbar /> : <Navbar />}

      {/* 2. Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              <Link href="/dashboard" className="hover:text-stone-600 no-underline">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-orange-600">Applications</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)]">
              Applications <span className="text-orange-600">Hub</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-xl">
              Switch between works you created to manage incoming bids, and projects you applied to for tracking your proposal status.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/explorework"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-stone-700 bg-white border border-[#E5DDD0] hover:bg-[#F4EFE6] rounded-xl shadow-xs transition-colors no-underline"
            >
              <Compass className="w-4 h-4 text-orange-600" />
              <span>Explore Works</span>
            </Link>

            <Link
              href="/post-work"
              className="group inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs hover:shadow-md transition-all no-underline"
            >
              <Plus className="w-4 h-4 text-orange-400 group-hover:rotate-90 transition-transform" />
              <span>Post Work</span>
            </Link>
          </div>
        </div>

        {/* 3. Segmented Pill Tab Switcher */}
        <div className="mb-8 p-1.5 bg-[#F4EFE6] border border-[#E5DDD0] rounded-2xl sm:rounded-full inline-flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-xs w-full sm:w-auto">
          {/* Tab 1: My Created Application (DEFAULT) */}
          <button
            type="button"
            id="tab-my-created"
            onClick={() => handleTabChange("my-created")}
            className={`group relative flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "my-created"
                ? "bg-white text-slate-950 shadow-sm border border-[#E5DDD0]"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg transition-colors ${
                activeTab === "my-created"
                  ? "bg-orange-50 text-orange-600"
                  : "bg-transparent text-stone-400 group-hover:text-stone-600"
              }`}
            >
              <Briefcase className="w-4 h-4" />
            </div>
            <span>My Created Application</span>
          </button>

          {/* Tab 2: Applied Application */}
          <button
            type="button"
            id="tab-applied"
            onClick={() => handleTabChange("applied")}
            className={`group relative flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "applied"
                ? "bg-white text-slate-950 shadow-sm border border-[#E5DDD0]"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg transition-colors ${
                activeTab === "applied"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-transparent text-stone-400 group-hover:text-stone-600"
              }`}
            >
              <Send className="w-4 h-4" />
            </div>
            <span>Applied Application</span>
          </button>
        </div>

        {/* 4. Active Tab Content View */}
        <div className="bg-white rounded-3xl border border-[#E5DDD0] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[480px]">
          {activeTab === "my-created" ? (
            <MyCreatedApplication />
          ) : (
            <AppliedApplication />
          )}
        </div>

        {/* 5. Helpful Tips & Navigation Footer */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white/70 rounded-2xl border border-[#E5DDD0] p-5 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                Need more freelancers for your projects?
              </h4>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                Post detailed descriptions, deadlines, and milestone budgets to attract verified talent ready to start right away.
              </p>
              <Link
                href="/post-work"
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline no-underline"
              >
                <span>Create a new work posting</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="bg-white/70 rounded-2xl border border-[#E5DDD0] p-5 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                Looking for new freelance opportunities?
              </h4>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                Browse our active marketplace of gigs, jobs, and full-time contracts with direct client communication and fair rates.
              </p>
              <Link
                href="/explorework"
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline no-underline"
              >
                <span>Explore all opportunities</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MyApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MyApplicationsContent />
    </Suspense>
  );
}