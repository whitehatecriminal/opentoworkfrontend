"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAppliedWorks } from "@/src/api/work";
import { sanitizeHtml } from "@/src/utils/dom";
import WorkDetails from "@/src/components/explorework/workdetails";
import {
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  X,
  Calendar,
  ArrowUpDown,
  FileText,
  Building2,
  Globe,
  Laptop,
  ArrowUpRight,
} from "lucide-react";

/**
 * Format date safely
 */
function formatDate(dateValue) {
  if (!dateValue) return "Recently";
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
 * Safe string extractor
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

export default function AppliedApplication() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedWorkForDetails, setSelectedWorkForDetails] = useState(null);

  // 1. Fetch user's applied works from /api/v1/work/takework
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["userAppliedWorks"],
    queryFn: getAppliedWorks,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  // 2. Normalize list of applications/works from backend response
  const applications = useMemo(() => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData.data)) return responseData.data;
    if (Array.isArray(responseData.data?.applications)) return responseData.data.applications;
    if (Array.isArray(responseData.data?.works)) return responseData.data.works;
    if (Array.isArray(responseData.applications)) return responseData.applications;
    if (Array.isArray(responseData.works)) return responseData.works;
    if (Array.isArray(responseData.data?.items)) return responseData.data.items;
    return [];
  }, [responseData]);

  // 3. Compute summary statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const accepted = applications.filter((app) => {
      const s = String(app.status || app.applicationStatus || "").toUpperCase();
      return s === "ACCEPTED" || s === "APPROVED";
    }).length;
    const pending = applications.filter((app) => {
      const s = String(app.status || app.applicationStatus || "PENDING").toUpperCase();
      return s === "PENDING" || s === "UNDER_REVIEW" || s === "APPLIED";
    }).length;
    const rejected = applications.filter((app) => {
      const s = String(app.status || app.applicationStatus || "").toUpperCase();
      return s === "REJECTED" || s === "DECLINED";
    }).length;

    return { total, accepted, pending, rejected };
  }, [applications]);

  // 4. Filter and sort applications
  const filteredApplications = useMemo(() => {
    let list = [...applications];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((app) => {
        const title = safeString(
          app.work?.title || app.workTitle || app.title
        ).toLowerCase();
        const proposal = safeString(app.proposal || app.coverLetter).toLowerCase();
        const category = safeString(
          app.work?.category?.name || app.work?.category || app.category
        ).toLowerCase();
        const location = safeString(
          app.work?.FullAddress || app.work?.locationName || app.location
        ).toLowerCase();
        return (
          title.includes(q) ||
          proposal.includes(q) ||
          category.includes(q) ||
          location.includes(q)
        );
      });
    }

    // Filter by Status
    if (selectedStatus !== "ALL") {
      list = list.filter((app) => {
        const s = String(app.status || app.applicationStatus || "PENDING").toUpperCase();
        if (selectedStatus === "ACCEPTED") return s === "ACCEPTED" || s === "APPROVED";
        if (selectedStatus === "PENDING") return s === "PENDING" || s === "UNDER_REVIEW" || s === "APPLIED";
        if (selectedStatus === "REJECTED") return s === "REJECTED" || s === "DECLINED";
        return s === selectedStatus;
      });
    }

    // Sort list
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.appliedAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.appliedAt || 0).getTime();
      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "bid-high") {
        const valA = Number(a.bidAmount || a.proposedFees || a.work?.fees || 0);
        const valB = Number(b.bidAmount || b.proposedFees || b.work?.fees || 0);
        return valB - valA;
      }
      if (sortBy === "bid-low") {
        const valA = Number(a.bidAmount || a.proposedFees || a.work?.fees || 0);
        const valB = Number(b.bidAmount || b.proposedFees || b.work?.fees || 0);
        return valA - valB;
      }
      return 0;
    });

    return list;
  }, [applications, searchQuery, selectedStatus, sortBy]);

  if (selectedWorkForDetails) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF7F2] overflow-y-auto w-screen h-screen min-h-screen">
        <WorkDetails
          work={selectedWorkForDetails}
          workId={selectedWorkForDetails.id || selectedWorkForDetails._id}
          onBack={() => setSelectedWorkForDetails(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner & Explore Work CTA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-[#E5DDD0]/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-[family-name:var(--font-playfair)] tracking-tight">
              My Applied Applications
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            Track status updates, submitted proposals, and client responses for works you took.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-[#E5DDD0] hover:bg-[#F4EFE6] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh applications"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-orange-600" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/explorework"
            className="group inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <span className="text-white">Explore More Works</span>
            <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 2. Metrics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400">
              Total Applied
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold text-stone-900 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.total}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500">Proposals submitted</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
            <Send className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400">
              Pending Review
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold text-amber-600 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.pending}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500">Awaiting decision</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400">
              Accepted / Awarded
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold text-emerald-600 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.accepted}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500">Approved by client</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400">
              Rejected / Closed
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-bold text-rose-600 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.rejected}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500">Not selected</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applied works by title, proposal snippet, category..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: "All" },
            { id: "PENDING", label: "Pending" },
            { id: "ACCEPTED", label: "Accepted" },
            { id: "REJECTED", label: "Rejected" },
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
              <option value="newest">Recently Applied</option>
              <option value="oldest">Earliest Applied</option>
              <option value="bid-high">Proposed Bid: High to Low</option>
              <option value="bid-low">Proposed Bid: Low to High</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Applications Grid */}
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
            Failed to Load Applied Works
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mb-6">
            {error?.response?.data?.message ||
              error?.message ||
              "Could not fetch your applied works. Please ensure you are logged in and try again."}
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
      ) : filteredApplications.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#E5DDD0] p-8 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-4">
            <Send className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 font-[family-name:var(--font-playfair)]">
            {searchQuery || selectedStatus !== "ALL"
              ? "No Matching Applications Found"
              : "No Applications Submitted Yet"}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mb-6 max-w-md mx-auto leading-relaxed">
            {searchQuery || selectedStatus !== "ALL"
              ? "No applied applications match your active filters. Try searching with different terms."
              : "You haven't applied to any work projects yet. Browse available jobs on the Explore Work page to submit your first proposal."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
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
            ) : (
              <Link
                href="/explorework"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all no-underline"
              >
                <span>Browse Available Works</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Application Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app, idx) => {
            const appId = app.id || app._id || `app-${idx}`;
            const title = safeString(
              app.work?.title || app.workTitle || app.title,
              "Untitled Project"
            );
            const workType = safeString(app.work?.workType || app.workType, "ONSITE");
            const categoryName = safeString(
              app.work?.category?.name || app.work?.category || app.category,
              "General"
            );
            const status = String(app.status || app.applicationStatus || "PENDING").toUpperCase();
            const proposal = safeString(app.proposal || app.coverLetter || "");
            const bidAmount = app.bidAmount ?? app.proposedFees ?? null;
            const originalFees = app.work?.fees ?? app.fees ?? null;
            const estimatedDays = app.estimatedDays ?? null;
            const appliedDate = formatDate(app.createdAt || app.appliedAt);

            return (
              <div
                key={appId}
                onClick={() => setSelectedWorkForDetails(app.work || app)}
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

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        status === "ACCEPTED" || status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : status === "REJECTED" || status === "DECLINED"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {status === "ACCEPTED" ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : status === "REJECTED" ? (
                        <XCircle className="w-3 h-3 text-rose-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      )}
                      {status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2 font-[family-name:var(--font-playfair)]">
                    {title}
                  </h3>

                  {/* Proposal Snippet */}
                  <div className="mb-4 bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DDD0]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Your Proposal Snippet
                    </span>
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed italic">
                      &ldquo;{proposal || "No proposal text attached with this application."}&rdquo;
                    </p>
                  </div>

                  {/* Application Timeline Details */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-4 px-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" /> Applied {appliedDate}
                    </span>
                    {estimatedDays && (
                      <span className="font-medium text-stone-700">
                        {estimatedDays} Days Delivery
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Bid vs Budget & View */}
                <div className="pt-4 border-t border-[#E5DDD0]/70 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                      Proposed Bid
                    </span>
                    <span className="text-sm sm:text-base font-bold text-orange-600 font-[family-name:var(--font-jakarta)]">
                      {bidAmount
                        ? `₹${Number(bidAmount).toLocaleString()}`
                        : originalFees
                        ? `₹${Number(originalFees).toLocaleString()}`
                        : "Fixed Bid"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApplication(app);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-stone-200 rounded-xl transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Application</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Detailed Application Modal */}
      {selectedApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#E5DDD0] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E5DDD0] bg-[#FAF7F2]/60 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                    {safeString(selectedApplication.work?.workType || selectedApplication.workType, "ONSITE")}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {safeString(selectedApplication.work?.category?.name || selectedApplication.work?.category || selectedApplication.category, "General")}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      String(selectedApplication.status || selectedApplication.applicationStatus || "PENDING").toUpperCase() === "ACCEPTED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : String(selectedApplication.status || selectedApplication.applicationStatus || "PENDING").toUpperCase() === "REJECTED"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {String(selectedApplication.status || selectedApplication.applicationStatus || "PENDING").toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-stone-900 font-[family-name:var(--font-playfair)]">
                  {safeString(selectedApplication.work?.title || selectedApplication.workTitle || selectedApplication.title, "Untitled Project")}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Status Stepper Tracker */}
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DDD0]">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                  Application Progress Tracker
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">Submitted</p>
                      <p className="text-[10px] text-stone-500">
                        {formatDate(selectedApplication.createdAt || selectedApplication.appliedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 h-0.5 bg-[#E5DDD0] mx-3" />

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        String(selectedApplication.status || "").toUpperCase() === "ACCEPTED" ||
                        String(selectedApplication.status || "").toUpperCase() === "REJECTED"
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-500 text-white animate-pulse"
                      }`}
                    >
                      {String(selectedApplication.status || "").toUpperCase() === "ACCEPTED" ||
                      String(selectedApplication.status || "").toUpperCase() === "REJECTED"
                        ? "✓"
                        : "•"}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">In Review</p>
                      <p className="text-[10px] text-stone-500">By project poster</p>
                    </div>
                  </div>

                  <div className="flex-1 h-0.5 bg-[#E5DDD0] mx-3" />

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        String(selectedApplication.status || "").toUpperCase() === "ACCEPTED"
                          ? "bg-emerald-500 text-white"
                          : String(selectedApplication.status || "").toUpperCase() === "REJECTED"
                          ? "bg-rose-500 text-white"
                          : "bg-stone-200 text-stone-500"
                      }`}
                    >
                      {String(selectedApplication.status || "").toUpperCase() === "ACCEPTED"
                        ? "✓"
                        : String(selectedApplication.status || "").toUpperCase() === "REJECTED"
                        ? "✕"
                        : "3"}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">Decision</p>
                      <p className="text-[10px] text-stone-500">
                        {String(selectedApplication.status || "PENDING").toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Submitted Proposal */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-orange-600" />
                  <span>Your Submitted Proposal</span>
                </h4>
                <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-200 text-stone-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {selectedApplication.proposal ||
                    selectedApplication.coverLetter ||
                    "No proposal text attached with this application."}
                </div>
              </div>

              {/* Bid Comparison Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DDD0]">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-stone-400 block">
                    Your Proposed Bid
                  </span>
                  <span className="text-sm font-bold text-orange-600 font-[family-name:var(--font-jakarta)]">
                    {selectedApplication.bidAmount
                      ? `₹${Number(selectedApplication.bidAmount).toLocaleString()}`
                      : "Standard"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-stone-400 block">
                    Original Budget
                  </span>
                  <span className="text-sm font-bold text-stone-800 font-[family-name:var(--font-jakarta)]">
                    {selectedApplication.work?.fees
                      ? `₹${Number(selectedApplication.work.fees).toLocaleString()}`
                      : "Negotiable"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-stone-400 block">
                    Delivery Timeline
                  </span>
                  <span className="text-xs font-semibold text-stone-800">
                    {selectedApplication.estimatedDays
                      ? `${selectedApplication.estimatedDays} days`
                      : "As per requirement"}
                  </span>
                </div>
              </div>

              {/* Original Work Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Project Description & Requirements
                </h4>
                {selectedApplication.work?.description ? (
                  <div
                    className="prose prose-sm max-w-none text-stone-700 bg-white p-4 rounded-2xl border border-[#E5DDD0] leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(selectedApplication.work.description),
                    }}
                  />
                ) : (
                  <p className="text-xs text-stone-500 italic bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DDD0]">
                    Project details not loaded or completed.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E5DDD0] bg-[#FAF7F2]/60 flex items-center justify-between">
              <Link
                href="/explorework"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline no-underline"
              >
                Browse other works
              </Link>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
