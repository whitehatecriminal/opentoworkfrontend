"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/src/components/Navbar";
import UserNavbar from "@/src/components/User/usernavbar";
import WorkDetails from "@/src/components/explorework/workdetails";
import { useAuthStore } from "@/src/store/authstore";
import { getWorks } from "@/src/api/work";
import { htmlToPlainText } from "@/src/utils/dom.js";

export interface WorkItem {
  id?: unknown;
  title?: unknown;
  workTitle?: unknown;
  workType?: unknown;
  description?: unknown;
  company?: unknown;
  categoryname?: unknown;
  client?: unknown;
  budget?: unknown;
  price?: unknown;
  fees?: unknown;
  budgetType?: unknown;
  category?: unknown;
  skills?: unknown;
  tags?: unknown;
  status?: unknown;
  deadline?: unknown;
  duration?: unknown;
  applicantsCount?: number;
  totalApplications?: number;
  location?: unknown;
  experienceLevel?: unknown;
  createdAt?: unknown;
  [key: string]: unknown;
}

function safeExtractString(val: unknown, fallback = ""): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    const candidate = obj.name || obj.title || obj.label || obj.value || obj.id;
    if (typeof candidate === "string") return candidate;
    if (typeof candidate === "number") return String(candidate);
    return fallback;
  }
  return String(val);
}

const CATEGORIES = [
  "All",
  "Web Development",
  "UI/UX Design",
  "Mobile Apps",
  "Backend & APIs",
  "AI & Machine Learning",
  "Content & Copywriting",
  "DevOps & Cloud",
];

export default function ExploreWorkPage() {
  const { isAuthenticated } = useAuthStore();
  
  // Query state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "budget-high" | "budget-low">("newest");

  // Selected work for WorkDetails Screen
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);

  // TanStack Query for works
  const {
    data: worksResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["works", currentPage, limit, searchQuery, selectedCategory, selectedStatus],
    queryFn: () =>
      getWorks({
        page: currentPage,
        limit: limit,
        search: searchQuery.trim(),
        category: selectedCategory,
        status: selectedStatus,
      }),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });

  // Normalize works data from various possible backend formats
  const rawWorks: WorkItem[] = useMemo(() => {
    if (!worksResponse) return [];
    if (Array.isArray(worksResponse)) return worksResponse;
    if (Array.isArray(worksResponse.data)) return worksResponse.data;
    if (Array.isArray(worksResponse.works)) return worksResponse.works;
    if (Array.isArray(worksResponse.data?.works)) return worksResponse.data.works;
    if (Array.isArray(worksResponse.data?.items)) return worksResponse.data.items;
    return [];
  }, [worksResponse]);

  // Pagination metadata
  const pagination = useMemo(() => {
    const meta =
      worksResponse?.pagination ||
      worksResponse?.data?.pagination ||
      worksResponse?.meta ||
      {};
    
    const totalItems =
      meta.total ||
      meta.totalItems ||
      worksResponse?.total ||
      worksResponse?.data?.total ||
      rawWorks.length;

    const totalPages =
      meta.totalPages ||
      meta.pages ||
      worksResponse?.totalPages ||
      Math.max(1, Math.ceil(totalItems / limit));

    return {
      total: totalItems,
      totalPages: totalPages,
      currentPage: meta.currentPage || meta.page || currentPage,
      hasNextPage: meta.hasNextPage ?? (currentPage < totalPages),
      hasPrevPage: meta.hasPrevPage ?? (currentPage > 1),
    };
  }, [worksResponse, rawWorks.length, limit, currentPage]);

  // Client-side sorting when needed
  const displayWorks = useMemo(() => {
    const list = [...rawWorks];
    if (sortBy === "newest") {
      list.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } else if (sortBy === "budget-high") {
      list.sort((a, b) => {
        const valA = Number(a.fees || a.budget || a.price || 0);
        const valB = Number(b.fees || b.budget || b.price || 0);
        return valB - valA;
      });
    } else if (sortBy === "budget-low") {
      list.sort((a, b) => {
        const valA = Number(a.fees || a.budget || a.price || 0);
        const valB = Number(b.fees || b.budget || b.price || 0);
        return valA - valB;
      });
    }
    return list;
  }, [rawWorks, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      {/* 1. Dynamic Header */}
      {isAuthenticated ? <UserNavbar /> : <Navbar />}

      {/* 2. Full-Screen Work Details Screen */}
      {selectedWork ? (
        <WorkDetails
          work={selectedWork}
          workId={safeExtractString(selectedWork.id)}
          onBack={() => setSelectedWork(null)}
        />
      ) : (
        /* 3. Main Exploration Container */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Header Title & Subtitle */}
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)]">
            Explore Open <span className="text-orange-600">Works & Projects</span>
          </h1>
          <p className="mt-2.5 text-stone-600 text-sm sm:text-base max-w-2xl">
            Discover curated freelance and contract projects, connect directly with verified clients, and submit tailored proposals.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5DDD0] shadow-[0_4px_25px_rgba(0,0,0,0.03)] mb-8 transition-all">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            
            {/* Search Bar Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search projects by title, skill, or keywords (e.g. Next.js, UI/UX)..."
                className="w-full pl-10 pr-10 py-3 bg-[#FAF7F2]/80 border border-[#E5DDD0] rounded-2xl text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort & Status Selectors */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "budget-high" | "budget-low")}
                className="appearance-none pl-4 pr-9 py-3 bg-[#FAF7F2]/80 border border-[#E5DDD0] rounded-2xl text-xs sm:text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="budget-high">Budget: High to Low</option>
                <option value="budget-low">Budget: Low to High</option>
              </select>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh listings"
                className="p-3 bg-[#FAF7F2]/80 border border-[#E5DDD0] rounded-2xl text-stone-600 hover:text-orange-600 hover:border-orange-200 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className={`w-5 h-5 ${isFetching ? "animate-spin text-orange-600" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="mt-4 pt-4 border-t border-[#E5DDD0]/70 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-sm shadow-orange-500/20 border border-orange-600 font-semibold"
                      : "bg-[#FAF7F2] text-stone-600 hover:bg-[#F4EFE6] hover:text-stone-900 border border-[#E5DDD0]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-xs sm:text-sm font-medium text-stone-500">
            {isLoading ? (
              "Loading works..."
            ) : (
              <>
                Showing <span className="font-semibold text-stone-900">{displayWorks.length}</span>{" "}
                {displayWorks.length === 1 ? "opportunity" : "opportunities"}
                {selectedCategory !== "All" && <span> in <span className="text-orange-600 font-semibold">{selectedCategory}</span></span>}
              </>
            )}
          </p>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 border border-stone-200">
            Page {currentPage} of {pagination.totalPages || 1}
          </span>
        </div>

        {/* 3. Works Grid / Skeleton / Error / Empty States */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: limit }).map((_, index) => (
              <div
                key={`skel-${index}`}
                className="bg-white rounded-3xl border border-[#E5DDD0] p-6 shadow-xs animate-pulse flex flex-col justify-between h-[340px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-20 h-5 bg-stone-200 rounded-full" />
                    <div className="w-16 h-5 bg-stone-200 rounded-full" />
                  </div>
                  <div className="w-3/4 h-6 bg-stone-200 rounded-md mb-2" />
                  <div className="w-full h-4 bg-stone-200 rounded-md mb-1" />
                  <div className="w-5/6 h-4 bg-stone-200 rounded-md mb-4" />
                  <div className="flex gap-2">
                    <div className="w-14 h-6 bg-stone-200 rounded-lg" />
                    <div className="w-14 h-6 bg-stone-200 rounded-lg" />
                  </div>
                </div>
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="w-20 h-6 bg-stone-200 rounded-md" />
                  <div className="w-24 h-8 bg-stone-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="bg-white rounded-3xl border border-red-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Unable to Load Works</h3>
            <p className="text-sm text-stone-500 mb-6">
              {(error as Error)?.message || "A network error occurred while fetching project opportunities."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        ) : displayWorks.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-[#E5DDD0] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 font-[family-name:var(--font-playfair)]">
              No Opportunities Found
            </h3>
            <p className="text-sm text-stone-500 mb-6">
              We couldn’t find any works matching your search or active filters. Try adjusting your query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedStatus("All");
                setCurrentPage(1);
              }}
              className="px-5 py-2.5 bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#E5DDD0] text-stone-800 text-sm font-semibold rounded-2xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayWorks.map((work, idx) => {
              const workId = safeExtractString(work.id, `work-${idx}`);
              const title = safeExtractString(work.title || work.workTitle, "Untitled Project");
              const workType = safeExtractString(work.workType, "ONSITE");
              const budgetVal = work.fees ?? work.budget ?? work.price ?? null;
              const rawSkills = Array.isArray(work.skills) ? work.skills : Array.isArray(work.tags) ? work.tags : [];
              const skills = rawSkills.map((s) => safeExtractString(s, String(s)));
              const statusText = safeExtractString(work.status, "Open");
              const rawDesc = typeof work.description === "string" ? work.description : "";
              const descriptionText = htmlToPlainText(rawDesc);


              return (
                <div
                  key={workId}
                  onClick={() => setSelectedWork(work)}
                  className="group bg-white rounded-3xl border border-[#E5DDD0] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Card Top: Client & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-700 border border-gray-200/60">
                        {workType}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {statusText}
                      </span>
                    </div>

                    {/* Work Title */}
                    <h3 className="text-base font-bold text-stone-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors font-[family-name:var(--font-playfair)]">
                      {title}
                    </h3>

                    {/* Description Snippet */}
                    <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 mb-4 leading-relaxed">
                      {descriptionText || "No description provided for this work listing."}
                    </p>

                    {/* Skill Tags */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {skills.slice(0, 3).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-0.5 rounded-lg bg-[#FAF7F2] border border-[#E5DDD0] text-stone-700 text-[11px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {skills.length > 3 && (
                          <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-500 text-[11px] font-medium">
                            +{skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Budget & Action Button */}
                  <div className="pt-4 border-t border-[#E5DDD0]/70 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                        Budget
                      </span>
                      <span className="text-sm font-bold text-stone-900">
                        {budgetVal ? (typeof budgetVal === "number" ? `₹${budgetVal.toLocaleString()}` : `${budgetVal}`) : "Negotiable"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWork(work);
                      }}
                      className="px-4 py-2 bg-stone-900 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      View & Apply
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Pagination Controls (8 items per page) */}
        {!isLoading && !isError && displayWorks.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-[#E5DDD0] shadow-xs">
            <span className="text-xs sm:text-sm font-medium text-stone-500">
              Showing Page <span className="font-bold text-stone-900">{currentPage}</span> of{" "}
              <span className="font-bold text-stone-900">{pagination.totalPages}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[#E5DDD0] bg-[#FAF7F2] hover:bg-white disabled:opacity-40 disabled:hover:bg-[#FAF7F2] text-stone-700 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Numbered Page Buttons */}
              <div className="hidden sm:flex items-center gap-1.5">
                {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-orange-600 text-white shadow-sm shadow-orange-500/20 border border-orange-600"
                          : "bg-[#FAF7F2] hover:bg-white text-stone-600 border border-[#E5DDD0]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[#E5DDD0] bg-[#FAF7F2] hover:bg-white disabled:opacity-40 disabled:hover:bg-[#FAF7F2] text-stone-700 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
      )}
    </div>
  );
}
