"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWorkApplications, updateWorkApplicationStatus } from "@/src/api/work";
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Copy,
  Check,
  Calendar,
  Building2,
  Globe,
  Laptop,
  ArrowUpDown,
  FileText,
  Share2,
} from "lucide-react";

/**
 * Format date string safely
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

/**
 * WorkApplicationsFullScreen
 *
 * Full-screen view (100% viewport width and height) displaying all users who
 * applied / submitted bids for a specific work item via GET /api/v1/work/workapplications/:workId
 */
export default function WorkApplicationsFullScreen({ work, workId, onBack }) {
  const id = workId || work?.id || work?._id;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onBack?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  // 1. Fetch applications for this work item
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["workApplications", id],
    queryFn: () => getWorkApplications(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const handleAssign = async(id) => {
    try{
      if (!id) {
        if (typeof toast !== "undefined") toast.error("Invalid work application ID");
        return;
      }
      const response = await updateWorkApplicationStatus(id);
      if(response.status === 200){
        if (typeof toast !== "undefined") toast.success("Work assigned successfully");
        refetch();
      }
    }catch(err){
      if (typeof toast !== "undefined") toast.error("Error assigning work");
    }
  }

  // 2. Normalize list of applications from API response
  const applications = useMemo(() => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData.data)) return responseData.data;
    if (Array.isArray(responseData.data?.applications)) return responseData.data.applications;
    if (Array.isArray(responseData.applications)) return responseData.applications;
    if (Array.isArray(responseData.data?.items)) return responseData.data.items;
    if (Array.isArray(responseData.data?.works)) return responseData.data.works;
    return [];
  }, [responseData]);

  // 3. Extract work details
  const workTitle = safeString(work?.title || work?.workTitle, "Work Project");
  const workBudget = work?.fees ?? work?.budget ?? null;
  const workType = safeString(work?.workType, "ONSITE");
  const workCategory = safeString(work?.category?.name || work?.category, "General");
  const workStatus = safeString(
    work?.status || work?.workStatus || responseData?.work?.status || responseData?.data?.work?.status,
    "OPEN"
  ).toUpperCase();

  // 4. Compute statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((app) => {
      const s = String(app.status || "PENDING").toUpperCase();
      return s === "PENDING" || s === "UNDER_REVIEW";
    }).length;
    const accepted = applications.filter((app) => {
      const s = String(app.status || "").toUpperCase();
      return s === "ACCEPTED" || s === "APPROVED";
    }).length;
    const rejected = applications.filter((app) => {
      const s = String(app.status || "").toUpperCase();
      return s === "REJECTED" || s === "DECLINED";
    }).length;

    return { total, pending, accepted, rejected };
  }, [applications]);

  // 5. Filter and sort applications
  const filteredApplications = useMemo(() => {
    let list = [...applications];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((app) => {
        const u = app.user || app.applicant || {};
        const userName = safeString(u.name || u.fullName || u.displayName || app.userName).toLowerCase();
        const userEmail = safeString(u.email || app.userEmail).toLowerCase();
        const proposal = safeString(app.proposal || app.coverLetter).toLowerCase();
        return userName.includes(q) || userEmail.includes(q) || proposal.includes(q);
      });
    }

    // Status filter
    if (selectedStatus !== "ALL") {
      list = list.filter((app) => {
        const s = String(app.status || "PENDING").toUpperCase();
        if (selectedStatus === "ACCEPTED") return s === "ACCEPTED" || s === "APPROVED";
        if (selectedStatus === "PENDING") return s === "PENDING" || s === "UNDER_REVIEW";
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
      if (sortBy === "bid-low") {
        return Number(a.bidAmount || 0) - Number(b.bidAmount || 0);
      }
      if (sortBy === "bid-high") {
        return Number(b.bidAmount || 0) - Number(a.bidAmount || 0);
      }
      if (sortBy === "timeline-fast") {
        return Number(a.estimatedDays || 9999) - Number(b.estimatedDays || 9999);
      }
      return 0;
    });

    return list;
  }, [applications, searchQuery, selectedStatus, sortBy]);

  const handleCopyEmail = (email, e) => {
    e.stopPropagation();
    if (email && typeof window !== "undefined") {
      navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    }
  };

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/explorework?id=${id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen min-h-screen overflow-y-auto bg-[#FAF7F2] text-[#1C1917] flex flex-col animate-in fade-in duration-200">
      
      {/* ── 1. STICKY TOP FULL-WIDTH NAVBAR ── */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DDD0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Back button & Work Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F4EFE6] border border-[#E5DDD0] text-stone-700 text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600" />
              <span>Back</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Applicants for
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    workStatus === "OPEN" || workStatus === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : workStatus === "COMPLETED"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {workStatus}
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-stone-900 truncate font-[family-name:var(--font-playfair)]">
                {workTitle}
              </h1>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-[#E5DDD0] hover:bg-[#F4EFE6] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh applications"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-orange-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-[#E5DDD0] hover:bg-[#F4EFE6] rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Copy work listing link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-600" />
                  <span className="hidden sm:inline">Share Work</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. FULL-SCREEN SCROLLABLE CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Work Summary Hero Card */}
        <div className="bg-white rounded-3xl border border-[#E5DDD0] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                {workType === "REMOTE" ? (
                  <Globe className="w-3 h-3 text-stone-500" />
                ) : workType === "HYBRID" ? (
                  <Laptop className="w-3 h-3 text-stone-500" />
                ) : (
                  <Building2 className="w-3 h-3 text-stone-500" />
                )}
                {workType}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF7F2] text-stone-600 border border-[#E5DDD0]">
                {workCategory}
              </span>
              <span className="text-xs text-stone-400">
                Posted {formatDate(work?.createdAt)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-[family-name:var(--font-playfair)]">
              {workTitle}
            </h2>

            {work?.validUntil && (
              <p className="text-xs text-stone-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Valid until: <strong>{formatDate(work.validUntil)}</strong></span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-6 self-start md:self-auto bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DDD0]/80">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                Target Budget
              </span>
              <span className="text-lg sm:text-xl font-bold text-stone-900 font-[family-name:var(--font-jakarta)]">
                {workBudget ? `₹${Number(workBudget).toLocaleString()}` : "Negotiable"}
              </span>
            </div>

            <div className="w-px h-10 bg-[#E5DDD0]" />

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                Total Proposals
              </span>
              <span className="text-lg sm:text-xl font-bold text-blue-600 font-[family-name:var(--font-jakarta)]">
                {isLoading ? "..." : stats.total} {stats.total === 1 ? "Bid" : "Bids"}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Counter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Total Bids
              </span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-stone-900 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.total}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Pending Review
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.pending}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Accepted
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.accepted}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Declined
              </span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-rose-600 font-[family-name:var(--font-jakarta)]">
              {isLoading ? "..." : stats.rejected}
            </p>
          </div>
        </div>

        {/* Search, Status & Sort Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#E5DDD0] p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by applicant name, email, or proposal text..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Status Tabs */}
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
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 text-xs font-semibold bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl text-stone-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="newest">Recently Applied</option>
              <option value="oldest">Earliest Applied</option>
              <option value="bid-low">Bid: Low to High</option>
              <option value="bid-high">Bid: High to Low</option>
              <option value="timeline-fast">Timeline: Fastest</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* ── 3. APPLICANTS GRID / LIST ── */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-[#E5DDD0] p-6 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-stone-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-32 h-4 bg-stone-200 rounded" />
                    <div className="w-48 h-3 bg-stone-200 rounded" />
                  </div>
                </div>
                <div className="w-full h-16 bg-stone-100 rounded-xl" />
                <div className="flex justify-between pt-2">
                  <div className="w-24 h-4 bg-stone-200 rounded" />
                  <div className="w-24 h-4 bg-stone-200 rounded" />
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
              Failed to Load Applications
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mb-6">
              {error?.response?.data?.message ||
                error?.message ||
                "Could not retrieve applicant details for this project."}
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
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 font-[family-name:var(--font-playfair)]">
              {searchQuery || selectedStatus !== "ALL"
                ? "No Matching Applicants Found"
                : "No Applications Received Yet"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mb-6 max-w-md mx-auto leading-relaxed">
              {searchQuery || selectedStatus !== "ALL"
                ? "No applicant proposals match your active search or filters. Try adjusting your query."
                : "Your work listing is live. When freelancers apply and submit their bids, you will see their complete user profile, proposed bid, and cover letter here."}
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
                  Reset Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to My Created Works</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Applicant Cards Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {filteredApplications.map((app, idx) => {
              const appId = app.id || app._id || `applicant-${idx}`;
              const userObj = app.user || app.applicant || {};
              const userName = safeString(
                userObj.name || userObj.fullName || userObj.displayName || app.userName,
                `Applicant #${idx + 1}`
              );
              const userEmail = safeString(userObj.email || app.userEmail);
              const userPhone = safeString(userObj.phone || userObj.mobile || app.phone);
              const userPhoto = userObj.profileImage || userObj.photoURL || userObj.avatar || null;
              const userInitial = (userName?.[0] || userEmail?.[0] || "A").toUpperCase();
              const userBio = safeString(userObj.bio || userObj.headline || userObj.title);
              const proposal = safeString(app.proposal || app.coverLetter || app.message);
              const bidAmount = app.bidAmount ?? app.proposedFees ?? null;
              const estimatedDays = app.estimatedDays ?? null;
              const appliedDate = formatDate(app.createdAt || app.appliedAt);
              const status = String(app.status || "PENDING").toUpperCase();
              console.log("Staus", status)

              return (
                <div
                  key={appId}
                  className="bg-white rounded-3xl border border-[#E5DDD0] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#D0C5B4] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    
                    {/* User Header Information */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500 shadow-xs flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-600 text-white font-bold text-base shrink-0">
                          {userPhoto ? (
                            <img
                              src={userPhoto}
                              alt={userName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{userInitial}</span>
                          )}
                        </div>

                        {/* Name, Email & Bio */}
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-stone-900">
                            {userName}
                          </h3>
                          {userEmail && (
                            <p className="text-xs text-stone-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-stone-400" />
                              <span>{userEmail}</span>
                            </p>
                          )}
                          {userBio && (
                            <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-1 italic">
                              {userBio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Application Status Pill */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${
                          status === "ACCEPTED" || status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : status === "REJECTED" || status === "DECLINED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {status === "ACCEPTED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : status === "REJECTED" ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3 animate-spin" />
                        )}
                        {status}
                      </span>
                    </div>

                    {/* Proposed Bid & Timeline Card */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5DDD0]/70">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                          Proposed Bid
                        </span>
                        <span className="text-sm sm:text-base font-bold text-orange-600 font-[family-name:var(--font-jakarta)]">
                          {bidAmount ? `₹${Number(bidAmount).toLocaleString()}` : "Open Proposal"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                          Delivery Time
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-stone-800">
                          {estimatedDays ? `${estimatedDays} days` : "Standard"}
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                          Submitted On
                        </span>
                        <span className="text-xs font-semibold text-stone-700">
                          {appliedDate}
                        </span>
                      </div>
                    </div>

                    {/* Proposal / Cover Letter */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-orange-600" />
                        <span>Submitted Proposal</span>
                      </div>
                      <div className="p-4 bg-orange-50/30 rounded-2xl border border-orange-200/70 text-stone-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {proposal || "No proposal cover letter provided with this bid."}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Contact Actions */}
                  <div className="pt-4 mt-4 border-t border-[#E5DDD0]/70 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {userEmail && (
                        <a
                          href={`mailto:${userEmail}?subject=Regarding your application for ${encodeURIComponent(
                            workTitle
                          )}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-orange-50 hover:text-orange-600 border border-[#E5DDD0] rounded-xl transition-colors no-underline"
                        >
                          <Mail className="w-3.5 h-3.5 text-orange-600" />
                          <span>Email</span>
                        </a>
                      )}

                      {userPhone && (
                        <a
                          href={`tel:${userPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-[#E5DDD0] rounded-xl transition-colors no-underline"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Call</span>
                        </a>
                      )}

                      {userEmail && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyEmail(userEmail, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#E5DDD0] rounded-xl transition-colors cursor-pointer"
                          title="Copy email address"
                        >
                          {copiedEmail === userEmail ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 text-[11px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-stone-500" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>
                      )}

                      {workStatus !== "COMPLETED" && (
                        <button
                          type="button"
                          onClick={() => handleAssign(workId)} 
                          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl cursor-pointer transition-colors"
                        >
                          Assign
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] font-medium text-stone-400">
                      ID: {String(appId).slice(0, 8)}...
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
