"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import UserNavbar from "@/src/components/User/usernavbar";
import { useAuthStore } from "@/src/store/authstore";
import { Dashboard } from "@/src/api/user";

interface ApplicationItem {
  id?: string;
  work?: {
    title?: string;
  }
  title?: string;
  status?: string;
  createdAt?: string | number | Date;
}

const emptySubscribe = () => () => {};

export default function DashboardPage() {
  const router = useRouter();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const { user, token, isAuthenticated } = useAuthStore();

  // 1. Fetch dashboard data via TanStack Query
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["userDashboard"],
    queryFn: Dashboard,
    enabled: Boolean(isAuthenticated || token),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  useEffect(() => {
    // 2. If user is not logged in, redirect to /login page
    const state = useAuthStore.getState();
    const isUserLoggedIn = Boolean(state.isAuthenticated || state.token || state.user);
    if (!isUserLoggedIn) {
      router.push("/login");
    }
  }, [isAuthenticated, token, user, router]);

  // Prevent hydration mismatch / render loading state before checking auth
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Extract data from backend response: { data: { profile, stats, recentApplications } }
  const responseData = dashboardData?.data || {};
  const profile = responseData.profile || {};
  const stats = responseData.stats || {};
  const recentApplications = responseData.recentApplications || [];

  // Determine user display name
  const userName =
    profile.name ||
    user?.displayName ||
    user?.name ||
    user?.username ||
    user?.fullName ||
    (profile.email ? profile.email.split("@")[0] : user?.email ? user.email.split("@")[0] : "User");

  // Stat cards mapped directly to backend stats response
  const statCards = [
    {
      id: "available-works",
      title: "Available Works",
      value: isDashboardLoading ? "..." : (stats.availableWorks ?? 0),
      change: "Open for applications",
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: "bg-orange-50 border-orange-100",
      accent: "text-orange-600",
    },
    {
      id: "total-applications",
      title: "Total Applications",
      value: isDashboardLoading ? "..." : (stats.totalApplications ?? 0),
      change: "All-time submitted",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      iconBg: "bg-blue-50 border-blue-100",
      accent: "text-blue-600",
    },
    {
      id: "pending-applications",
      title: "Pending Applications",
      value: isDashboardLoading ? "..." : (stats.pendingApplications ?? 0),
      change: "Awaiting review",
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "bg-amber-50 border-amber-100",
      accent: "text-amber-600",
    },
    {
      id: "accepted-applications",
      title: "Accepted Applications",
      value: isDashboardLoading ? "..." : (stats.acceptedApplications ?? 0),
      change: "Approved & Active",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "bg-emerald-50 border-emerald-100",
      accent: "text-emerald-600",
    },
    {
      id: "completed-works",
      title: "Completed Works",
      value: isDashboardLoading ? "..." : (stats.completedWorks ?? 0),
      change: "Successfully delivered",
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      iconBg: "bg-indigo-50 border-indigo-100",
      accent: "text-indigo-600",
    },
    {
      id: "rejected-applications",
      title: "Rejected Applications",
      value: isDashboardLoading ? "..." : (stats.rejectedApplications ?? 0),
      change: "Unsuccessful",
      icon: (
        <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "bg-rose-50 border-rose-100",
      accent: "text-rose-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* 1. Navigation Bar */}
      <UserNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* 2. Welcome Banner */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)]">
              Hello, <span className="text-orange-500 capitalize">{userName}!</span>
            </h1>
          </div>

          {isDashboardError && (
            <button
              type="button"
              onClick={() => refetchDashboard()}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Fetch
            </button>
          )}
        </div>

        {/* 3. Metrics Stat Cards Grid */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-stone-900 mb-4 font-[family-name:var(--font-playfair)]">
            Activity Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {statCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-[#E5DDD0] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#D9CFC1] transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    {card.title}
                  </span>
                  <div className={`p-2.5 rounded-xl border ${card.iconBg}`}>
                    {card.icon}
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#1C1917] font-[family-name:var(--font-jakarta)] tracking-tight">
                    {card.value}
                  </div>
                  <p className="mt-1 text-xs text-stone-400">
                    {card.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Recent Applications Section */}
        <div className="bg-white rounded-3xl border border-[#E5DDD0] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1C1917] font-[family-name:var(--font-playfair)]">
                Recent Applications
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Track the status of works and jobs you have applied to.
              </p>
            </div>
            <Link
              href="/my-applications"
              className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline no-underline"
            >
              View all
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="py-12 px-4 text-center border-2 border-dashed border-[#E5DDD0] rounded-2xl bg-[#FAF7F2]/40">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-stone-800">
                No applications submitted yet
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
                There are currently <span className="font-semibold text-orange-600">{stats.availableWorks ?? 0}</span> works available to apply for.
              </p>
              <div className="mt-5">
                <Link
                  href="/explorework"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors no-underline"
                >
                  Browse Available Works
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600">
                <thead className="bg-[#FAF7F2] text-xs font-semibold uppercase text-stone-500 tracking-wider border-b border-[#E5DDD0]">
                  <tr>
                    <th className="py-3 px-4">Work Title</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DDD0]/60">
                  {recentApplications.map((app: ApplicationItem, idx: number) => (
                    <tr key={app.id || idx} className="hover:bg-[#FAF7F2]/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-stone-900">
                        {app.work?.title || "Untitled Work"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-stone-500">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          app.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : app.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {app.status || "PENDING"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/my-applications/${app.id || ""}`}
                          className="text-xs font-semibold text-orange-600 hover:underline no-underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}