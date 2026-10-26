"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserWorks } from "@/src/api/work";
import { stripHtml } from "@/src/utils/dom";
import WorkDetails from "@/src/components/explorework/workdetails";
import WorkApplicationsFullScreen from "./workapplicationsfullscreen";
import {
  Briefcase,
  Users, Clock, CheckCircle2, AlertCircle, Search, RefreshCw,
  Eye,Calendar,ArrowUpDown,Building2,Globe,Laptop,Edit3,
} from "lucide-react";
import UpdateWorkModal from "./updateworkmodal";

/**
 * Format date string safely into readable format
 */
function formatDate(dateValue) {
  if (!dateValue) return "Not specified";
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(dateValue);
  }
}

/**
 * Safe string extractor for potentially nested objects
 */
function safeString(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    return val.name || val.title || val.label || val.value || fallback;
  }
  return String(val);
}

export default function MyCreatedApplication() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  
  // State for showing full project details using WorkDetails component
  const [selectedWorkForDetails, setSelectedWorkForDetails] = useState(null);

  // State for showing full-screen applied applications on bids click
  const [selectedWorkForBids, setSelectedWorkForBids] = useState(null);

  // State for updating a work directly via UpdateWorkModal
  const [workToUpdate, setWorkToUpdate] = useState(null);

  // 1. Fetch user's created works from /api/v1/work/userwork
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["userCreatedWorks"],
    queryFn: getUserWorks,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  // 2. Normalize list of works from various possible backend responses
  const works = useMemo(() => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData.data)) return responseData.data;
    if (Array.isArray(responseData.data?.works)) return responseData.data.works;
    if (Array.isArray(responseData.works)) return responseData.works;
    if (Array.isArray(responseData.data?.items)) return responseData.data.items;
    return [];
  }, [responseData]);

  // 3. Compute summary statistics
  const stats = useMemo(() => {
    const total = works.length;
    const open = works.filter((w) => {
      const s = String(w.status || "").toUpperCase();
      return s === "OPEN" || s === "ACTIVE";
    }).length;
    const pending = works.filter((w) => {
      const s = String(w.status || "").toUpperCase();
      return s === "PENDING" || s === "IN_PROGRESS";
    }).length;
    const completed = works.filter((w) => {
      const s = String(w.status || "").toUpperCase();
      return s === "COMPLETED" || s === "CLOSED";
    }).length;

    // Total applicants across all created works
    const totalApplicants = works.reduce((sum, w) => {
      const count =
        w.applicantsCount ??
        w.totalApplications ??
        (Array.isArray(w.applications) ? w.applications.length : 0);
      return sum + Number(count || 0);
    }, 0);

    return { total, open, pending, completed, totalApplicants };
  }, [works]);

  // 4. Filter and sort works
  const filteredWorks = useMemo(() => {
    let list = [...works];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((w) => {
        const title = safeString(w.title || w.workTitle).toLowerCase();
        const desc = safeString(w.description).toLowerCase();
        const category = safeString(w.category?.name || w.category).toLowerCase();
        const address = safeString(w.FullAddress || w.location).toLowerCase();
        return (
          title.includes(q) ||
          desc.includes(q) ||
          category.includes(q) ||
          address.includes(q)
        );
      });
    }

    // Filter by Status
    if (selectedStatus !== "ALL") {
      list = list.filter((w) => {
        const s = String(w.status || "OPEN").toUpperCase();
        if (selectedStatus === "ACTIVE") return s === "OPEN" || s === "ACTIVE";
        if (selectedStatus === "PENDING") return s === "PENDING" || s === "IN_PROGRESS";
        if (selectedStatus === "COMPLETED") return s === "COMPLETED" || s === "CLOSED";
        return s === selectedStatus;
      });
    }

    // Sort works
    list.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "budget-high") {
        return Number(b.fees || b.budget || 0) - Number(a.fees || a.budget || 0);
      }
      if (sortBy === "budget-low") {
        return Number(a.fees || a.budget || 0) - Number(b.fees || b.budget || 0);
      }
      return 0;
    });

    return list;
  }, [works, searchQuery, selectedStatus, sortBy]);

  // ── VIEW 1: FULL PROJECT DETAILS (USING WORKDETAILS COMPONENT) ──
  if (selectedWorkForDetails) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF7F2] overflow-y-auto w-screen h-screen min-h-screen">
        <WorkDetails
          work={selectedWorkForDetails}
          workId={selectedWorkForDetails.id || selectedWorkForDetails._id}
          isOwner={true}
          onWorkUpdated={() => refetch()}
          onBack={() => setSelectedWorkForDetails(null)}
        />
      </div>
    );
  }

  // ── VIEW 2: FULL SCREEN APPLICANT BIDS (VIA WORKAPPLICATIONS/:WORKID) ──
  if (selectedWorkForBids) {
    return (
      <WorkApplicationsFullScreen
        work={selectedWorkForBids}
        workId={selectedWorkForBids.id || selectedWorkForBids._id}
        onBack={() => setSelectedWorkForBids(null)}
      />
    );
  }

  // ── VIEW 3: FULL SCREEN UPDATE WORK SCREEN ──
  if (workToUpdate) {
    return (
      <UpdateWorkModal
        isOpen={true}
        work={workToUpdate}
        workId={workToUpdate.id || workToUpdate._id}
        onClose={() => setWorkToUpdate(null)}
        onSuccess={() => {
          refetch();
          setWorkToUpdate(null);
        }}
      />
    );
  }

  // ── VIEW 4: CREATED APPLICATIONS LIST VIEW ──
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-[#E5DDD0]/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-[family-name:var(--font-playfair)] tracking-tight">
              My Created Applications & Works
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            Monitor works you posted, track incoming applicant proposals, and manage status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-[#E5DDD0] hover:bg-[#F4EFE6] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh works"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-orange-600" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400">
              Total Posted
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold text-stone-900 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.total}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500">All-time listings</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400">
              Active / Open
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold text-emerald-600 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.open}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500">Accepting bids</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400">
              Proposals Received
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold text-blue-600 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.totalApplicants}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500">Total freelancer bids</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400">
              Pending / In Progress
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold text-amber-600 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.pending}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500">Under review</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search created works by title, description, category..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: "All" },
            { id: "ACTIVE", label: "Active" },
            { id: "PENDING", label: "Pending" },
            { id: "COMPLETED", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-[#FAF7F2] text-stone-600 hover:bg-[#F4EFE6] border border-[#E5DDD0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 text-xs font-semibold bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl text-stone-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget-high">Budget: High to Low</option>
              <option value="budget-low">Budget: Low to High</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Main Works Grid */}
      {isLoading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-[#E5DDD0] p-6 shadow-xs animate-pulse flex flex-col justify-between h-72"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-20 h-5 bg-stone-200 rounded-full" />
                  <div className="w-16 h-5 bg-stone-200 rounded-full" />
                </div>
                <div className="w-3/4 h-6 bg-stone-200 rounded-md mb-2" />
                <div className="w-full h-4 bg-stone-200 rounded-md mb-1" />
                <div className="w-5/6 h-4 bg-stone-200 rounded-md" />
              </div>
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="w-20 h-5 bg-stone-200 rounded-md" />
                <div className="w-24 h-8 bg-stone-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        /* Error State */
        <div className="bg-white rounded-3xl border border-red-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2 font-[family-name:var(--font-playfair)]">
            Failed to Load Your Works
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mb-6">
            {error?.response?.data?.message ||
              error?.message ||
              "Could not fetch your created works. Please ensure you are logged in and try again."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredWorks.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#E5DDD0] p-8 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 font-[family-name:var(--font-playfair)]">
            {searchQuery || selectedStatus !== "ALL"
              ? "No Matching Works Found"
              : "No Works Posted Yet"}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mb-6 max-w-md mx-auto leading-relaxed">
            {searchQuery || selectedStatus !== "ALL"
              ? "No created applications match your active search or filters. Try adjusting your search term."
              : "You haven't posted any work projects yet. Post a job to start receiving proposals and bids from qualified talent."}
          </p>

          {searchQuery || selectedStatus !== "ALL" ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("ALL");
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#FAF7F2] border border-[#E5DDD0] text-stone-700 hover:bg-[#F4EFE6] rounded-xl transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : (
        /* Work Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map((work) => {
            const workId = work.id || work._id;
            const title = safeString(work.title || work.workTitle, "Untitled Work");
            const workType = safeString(work.workType, "ONSITE");
            const categoryName = safeString(work.category?.name || work.category, "General");
            const status = String(work.status || "OPEN").toUpperCase();
            const fees = work.fees ?? work.budget ?? null;
            const desc = stripHtml(work.description || "");
            const applicantsCount =
              work.applicantsCount ??
              work.totalApplications ??
              (Array.isArray(work.applications) ? work.applications.length : 0);
            const createdDate = formatDate(work.createdAt);
            const validUntil = work.validUntil ? formatDate(work.validUntil) : null;

            return (
              <div
                key={workId}
                onClick={() => setSelectedWorkForDetails(work)}
                className="group bg-white rounded-3xl border border-[#E5DDD0] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                        {workType === "REMOTE" ? (
                          <Globe className="w-3 h-3 text-stone-500" />
                        ) : workType === "HYBRID" ? (
                          <Laptop className="w-3 h-3 text-stone-500" />
                        ) : (
                          <Building2 className="w-3 h-3 text-stone-500" />
                        )}
                        {workType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF7F2] text-stone-600 border border-[#E5DDD0]">
                        {categoryName}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        status === "OPEN" || status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : status === "COMPLETED" || status === "CLOSED"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          status === "OPEN" || status === "ACTIVE"
                            ? "bg-emerald-500 animate-pulse"
                            : status === "COMPLETED"
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        }`}
                      />
                      {status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2 font-[family-name:var(--font-playfair)]">
                    {title}
                  </h3>

                  {/* Description Snippet */}
                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 mb-4 leading-relaxed">
                    {desc || "No description provided for this work listing."}
                  </p>

                  {/* Date & Deadline Info */}
                  <div className="flex flex-col gap-1 text-[11px] text-stone-500 mb-4 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DDD0]/60">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-stone-400">
                        <Calendar className="w-3 h-3" /> Posted
                      </span>
                      <span className="font-medium text-stone-700">{createdDate}</span>
                    </div>
                    {validUntil && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-stone-400">
                          <Clock className="w-3 h-3" /> Valid Until
                        </span>
                        <span className="font-medium text-stone-700">{validUntil}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Budget, Bids OnClick & Actions */}
                <div className="pt-4 border-t border-[#E5DDD0]/70 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                      Budget / Fees
                    </span>
                    <span className="text-sm sm:text-base font-bold text-stone-900 font-[family-name:var(--font-jakarta)]">
                      {fees ? `₹${Number(fees).toLocaleString()}` : "Negotiable"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Update Work Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWorkToUpdate(work);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold transition-colors cursor-pointer"
                      title="Update work info"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Update</span>
                    </button>

                    {/* Bids button: triggers full-screen view of workapplications/:workId */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkForBids(work);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        applicantsCount > 0
                          ? "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 border border-blue-200 shadow-xs"
                          : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
                      }`}
                      title="View all applicant bids on full screen"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{applicantsCount} {applicantsCount === 1 ? "bid" : "bids"}</span>
                    </button>

                    {/* View Details Button: opens WorkDetails */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkForDetails(work);
                      }}
                      className="p-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 transition-colors cursor-pointer"
                      title="View full project details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
