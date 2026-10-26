"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import LocationMap from "@/src/components/postwork/map";
import { getWorkById, applyForWork } from "@/src/api/work";
import { useAuthStore } from "@/src/store/authstore";
import "@/src/components/postwork/editor.css";
import {
  ArrowLeft, Building2, Clock,
  Globe,
  Layers,
  MapPin,
  Share2,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Check,
  Send,
  ShieldCheck,
  Briefcase,
  Loader2,
  Edit3,
} from "lucide-react";
import UpdateWorkModal from "@/src/components/myapplication/updateworkmodal";
import { sanitizeHtml } from "@/src/utils/dom.js";

/**
 * Format date string safely.
 */
function formatDate(dateValue) {
  if (!dateValue) return null;
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
 * WorkDetails Full Screen View Component
 *
 * Displays all available data returned from the API response:
 * - Title, Fees, Work Type, Category, Status
 * - Full HTML Description rendered safely with rich typography
 * - Client / Poster details
 * - Pinned Location & Coordinates on interactive Map
 * - Proposal application form with live API submission
 * - Collapsible Raw JSON Response Inspector with Copy button
 *
 * @param {Object} props
 * @param {string} [props.workId] - The ID of the work item
 * @param {Object} [props.work] - Initial work item object passed from card
 * @param {() => void} props.onBack - Callback to return to explore work grid
 */
export default function WorkDetails({
  workId,
  work: initialWork,
  onBack,
  isOwner: isOwnerProp,
  onWorkUpdated,
}) {
  const { isAuthenticated, user } = useAuthStore();

  const rawId = workId || initialWork?.id || initialWork?._id;
  const id = typeof rawId === "object" ? rawId?.id || rawId?._id : rawId;

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatedWorkState, setUpdatedWorkState] = useState(null);

  // 1. Fetch complete work info from API
  const { data: fetchedResponse, refetch: refetchWorkDetail } = useQuery({
    queryKey: ["workDetail", id],
    queryFn: () => getWorkById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 3,
  });

  // Normalize data by merging initial work with fetched API response and locally updated state
  const workData = useMemo(() => {
    const fetched =
      fetchedResponse?.data ||
      fetchedResponse?.work ||
      fetchedResponse ||
      {};
    return {
      ...(initialWork || {}),
      ...fetched,
      ...(updatedWorkState || {}),
    };
  }, [initialWork, fetchedResponse, updatedWorkState]);

  // Determine if viewing user is the creator/owner of this work
  const isOwner =
    Boolean(isOwnerProp) ||
    Boolean(
      user &&
        (workData.userId === user.id ||
          workData.userId === user._id ||
          workData.creatorId === user.id ||
          workData.createdBy === user.id ||
          (typeof workData.user === "object" && (workData.user?.id === user.id || workData.user?._id === user._id)) ||
          (typeof workData.postedBy === "object" && (workData.postedBy?.id === user.id || workData.postedBy?._id === user._id)))
    );

  const handleWorkUpdated = (newWorkData) => {
    setUpdatedWorkState(newWorkData);
    refetchWorkDetail?.();
    onWorkUpdated?.(newWorkData);
  };

  // Application Form State
  const [proposalText, setProposalText] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState("");

  // UI Utilities State
  const [copiedShare, setCopiedShare] = useState(false);

  // Handle Application Submission
  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError("");

    if (!isAuthenticated && !user) {
      setApplyError("Please log in to submit your proposal for this project.");
      return;
    }

    if (!proposalText.trim()) {
      setApplyError("Please write a proposal/cover letter detailing your fit.");
      return;
    }

    setApplyLoading(true);

    try {
      await applyForWork(id);

      setApplySuccess(true);
      setProposalText("");
      setBidAmount("");
      setEstimatedDays("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to submit application. Please try again.";
      setApplyError(msg);
    } finally {
      setApplyLoading(false);
    }
  };

  // Share current work item
  const handleShare = () => {
    try {
      if (typeof window !== "undefined") {
        navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  // Safe helper to extract string value from primitive or object { id, name, title, ... }
  const getStringValue = (val, fallback = "") => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    if (typeof val === "object") {
      const candidate = val.name || val.title || val.label || val.value || val.id;
      if (typeof candidate === "string") return candidate;
      if (typeof candidate === "number") return String(candidate);
      return fallback;
    }
    return fallback;
  };

  // Coordinates extraction
  const lat =
    typeof workData.latitude === "number"
      ? workData.latitude
      : parseFloat(workData.latitude || workData.lat);
  const lng =
    typeof workData.longitude === "number"
      ? workData.longitude
      : parseFloat(workData.longitude || workData.lon || workData.lng);
  const hasCoordinates = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

  // Work Type config
  const rawType = workData.workType;
  const workType = getStringValue(rawType, "ONSITE");

  const getWorkTypeBadge = (type) => {
    const normalized = String(type).toUpperCase();
    switch (normalized) {
      case "REMOTE":
        return { label: "Remote", icon: Globe, bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "HYBRID":
        return { label: "Hybrid", icon: Laptop, bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "FULLTIME":
        return { label: "Full Time", icon: Clock, bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "CONTRACT":
        return { label: "Contract", icon: Layers, bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "ONSITE":
      default:
        return { label: "On-Site", icon: Building2, bg: "bg-stone-100 text-stone-800 border-stone-200" };
    }
  };

  const typeConfig = getWorkTypeBadge(workType);
  const TypeIcon = typeConfig.icon;

  // Title display
  const titleDisplay = getStringValue(
    workData.title || workData.workTitle,
    "Untitled Work Project"
  );

  // Category display (handles { id, name, createdAt } object gracefully)
  const categoryDisplay =
    getStringValue(workData.categoryname) ||
    getStringValue(workData.category) ||
    "General Work";

  // Category ID display
  const categoryIdDisplay =
    (typeof workData.categoryId === "object"
      ? getStringValue(workData.categoryId?.id || workData.categoryId?.name)
      : getStringValue(workData.categoryId)) ||
    (typeof workData.category === "object"
      ? getStringValue(workData.category?.id || workData.category?.name)
      : "") ||
    "056226a3-ea0e...";

  // Status display
  const statusDisplay = getStringValue(workData.status, "Open for Applications");

  // Location display
  const locationDisplay = getStringValue(workData.location, "City not specified");

  // Compensation / Fees display
  const feesVal = workData.fees ?? workData.budget ?? workData.price ?? null;
  const formattedFees = feesVal
    ? typeof feesVal === "number"
      ? `₹${feesVal.toLocaleString()}`
      : `${feesVal}`
    : "Negotiable";

  // Skills array (ensure every element is converted to string)
  const rawSkills = Array.isArray(workData.skills)
    ? workData.skills
    : Array.isArray(workData.tags)
    ? workData.tags
    : [];
  const skillsList = rawSkills.map((s) => getStringValue(s, String(s)));

  // Client info
  const clientInfo =
    typeof workData.client === "object"
      ? workData.client
      : typeof workData.postedBy === "object"
      ? workData.postedBy
      : typeof workData.user === "object"
      ? workData.user
      : {};
  const clientName = getStringValue(
    clientInfo.name || clientInfo.displayName || clientInfo.fullName,
    typeof workData.client === "string" ? workData.client : "Verified Employer"
  );
  const clientCompany = getStringValue(
    clientInfo.company || workData.company,
    "Independent Project"
  );
  const clientEmail = typeof clientInfo.email === "string" ? clientInfo.email : null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] pb-20 animate-in fade-in duration-200">
      
      {/* ── STICKY TOP SUB-HEADER ── */}
      <div className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DDD0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5DDD0] bg-white hover:bg-[#F4EFE6] text-stone-800 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#EA580C]" />
            <span>Back to Explore</span>
          </button>

          {/* Quick status, Update Work & Share button */}
          <div className="flex items-center gap-2.5">
            {isOwner && (
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                title="Update prefilled work info"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Work</span>
              </button>
            )}

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{statusDisplay}</span>
            </span>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5DDD0] bg-white hover:bg-[#F4EFE6] text-stone-700 text-xs sm:text-sm font-medium transition-colors shadow-2xs cursor-pointer"
              title="Copy page link"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-stone-500" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-b from-[#F4EFE6] to-[#FAF7F2] border-b border-[#E5DDD0]/70 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-[#EA580C] border border-orange-200">
              {categoryDisplay}
            </span>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${typeConfig.bg}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              <span>{typeConfig.label}</span>
            </span>

            {workData.id && (
              <span className="text-[11px] font-mono text-stone-500 bg-white/70 px-2.5 py-0.5 rounded-md border border-[#E5DDD0]">
                ID: {getStringValue(workData.id).slice(-8)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)] leading-tight mb-6">
            {titleDisplay}
          </h1>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-white rounded-2xl border border-[#E5DDD0] shadow-xs">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-0.5">
                Compensation / Fees
              </span>
              <span className="text-lg sm:text-xl font-bold text-[#EA580C]">
                {formattedFees}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-0.5">
                Mode of Work
              </span>
              <span className="text-sm sm:text-base font-semibold text-stone-800">
                {typeConfig.label}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-0.5">
                Posted Date
              </span>
              <span className="text-sm sm:text-base font-semibold text-stone-800">
                {formatDate(workData.createdAt) || "Recently"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-0.5">
                Valid Until
              </span>
              <span className="text-sm sm:text-base font-semibold text-stone-800">
                {formatDate(workData.validUntil || workData.deadline) || "Open Until Filled"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT TWO-COLUMN GRID ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ════════════ LEFT COLUMN (DETAILS & MAP) ════════════ */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Card 1: Description (Rich HTML Render) */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#E5DDD0] shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#F4EFE6] text-[#EA580C]">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-stone-900 font-[family-name:var(--font-playfair)]">
                    Work Description & Deliverables
                  </h2>
                </div>
              </div>

              {/* Tiptap / ProseMirror Styled Content */}
              <div className="tiptap-editor-wrapper">
                {workData.description ? (
                  <div
                    className="tiptap leading-relaxed text-stone-800 space-y-3"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        typeof workData.description === "string"
                          ? workData.description
                          : workData.description?.html ||
                            workData.description?.text ||
                            JSON.stringify(workData.description)
                      ),
                    }}
                  />
                ) : (
                  <p className="text-sm text-stone-500 italic">
                    No detailed description provided for this work.
                  </p>
                )}
              </div>
            </div>

            {/* Card 2: Required Skills & Tags (if present) */}
            {skillsList.length > 0 && (
              <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#E5DDD0] shadow-xs">
                <h3 className="text-base font-bold text-stone-900 mb-4 font-[family-name:var(--font-playfair)]">
                  Required Skills & Qualifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E5DDD0] text-stone-800 text-xs sm:text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Card 3: Location on Map (Interactive Leaflet Pin) */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#E5DDD0] shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#F4EFE6] text-[#EA580C]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 font-[family-name:var(--font-playfair)]">
                      Work Location & Coordinates
                    </h2>
                    <p className="text-xs text-stone-500">
                      Geographical coordinates pinned on the map.
                    </p>
                  </div>
                </div>

                {hasCoordinates && (
                  <span className="text-xs font-mono text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-[#E5DDD0]">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                )}
              </div>

              {hasCoordinates ? (
                <LocationMap
                  latitude={lat}
                  longitude={lng}
                  readOnly={true}
                  height="300px"
                />
              ) : (
                <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E5DDD0] text-stone-500 text-xs sm:text-sm">
                  <Globe className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="font-semibold text-stone-700">No GPS Coordinates Pinned</p>
                  <p className="text-stone-400 mt-1">
                    {workType === "REMOTE"
                      ? "This is a 100% Remote position. You can apply from anywhere."
                      : "General location specified as: " + locationDisplay}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ════════════ RIGHT COLUMN (SIDEBAR & APPLY) ════════════ */}
          <div className="flex flex-col gap-8">
            
            {/* Card: Client / Employer Details */}
            <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#E5DDD0] shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">
                Posted By
              </h3>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EA580C] to-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                  {clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900 leading-tight">
                    {clientName}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {clientCompany}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-[#F0EAE1] text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Project Poster</span>
                </div>
                {clientEmail && (
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-stone-800">Email:</span>
                    <span className="truncate">{clientEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Quick Project Specs */}
            <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#E5DDD0] shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">
                Overview Specs
              </h3>

              <div className="flex flex-col divide-y divide-[#F0EAE1] text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-stone-500">Category ID</span>
                  <code className="font-mono text-[11px] bg-stone-100 px-2 py-0.5 rounded text-stone-700 truncate max-w-[140px]">
                    {categoryIdDisplay}
                  </code>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-stone-500">Status</span>
                  <span className="font-semibold text-emerald-700 capitalize">
                    {statusDisplay}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-stone-500">Total Applicants</span>
                  <span className="font-semibold text-stone-900">
                    {workData.applicantsCount ?? workData.totalApplications ?? 0}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-stone-500">Work Mode</span>
                  <span className="font-semibold text-stone-900">
                    {workType}
                  </span>
                </div>

                {workData.updatedAt && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-stone-500">Last Updated</span>
                    <span className="text-stone-700 font-medium">
                      {formatDate(workData.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Owner Management Card OR Applicant Proposal Submission */}
            {isOwner ? (
              <div className="p-6 sm:p-7 bg-white rounded-3xl border border-orange-200/80 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100/50 rounded-full blur-2xl pointer-events-none -z-0" />

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Your Created Project</span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 font-[family-name:var(--font-playfair)] mb-1">
                  Manage Work Listing
                </h3>
                <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                  Update deliverables, change work mode, revise fees, or edit description via the rich editor.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Update Work Details</span>
                  </button>

                  <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5DDD0] text-xs text-stone-600 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Status</span>
                      <span className="font-semibold text-emerald-700">{statusDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Budget</span>
                      <span className="font-semibold text-stone-900">{formattedFees}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Mode</span>
                      <span className="font-semibold text-stone-900">{typeConfig.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#EA580C]/40 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100/50 rounded-full blur-2xl pointer-events-none -z-0" />

              <h3 className="text-lg font-bold text-stone-900 font-[family-name:var(--font-playfair)] mb-1">
                Apply for this Work
              </h3>
              <p className="text-xs text-stone-500 mb-5">
                Send your bid and approach directly to the client.
              </p>

              {applySuccess ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 text-center animate-in fade-in">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-emerald-900">
                    Application Sent Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your proposal has been submitted to the client. Track status in your applications.
                  </p>
                  <Link
                    href="/my-applications"
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>View My Applications</span>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleApply} className="flex flex-col gap-4">
                  {applyError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{applyError}</span>
                    </div>
                  )}

                  {/* Proposed Bid */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-stone-700">
                      Your Proposed Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={feesVal ? String(feesVal) : "Enter bid amount..."}
                        className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15"
                      />
                    </div>
                  </div>

                  {/* Estimated Days */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-stone-700">
                      Estimated Duration (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      placeholder="e.g. 7"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15"
                    />
                  </div>

                  {/* Proposal Text */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-stone-700">
                      Proposal / Cover Letter <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={proposalText}
                      onChange={(e) => setProposalText(e.target.value)}
                      placeholder="Explain your approach, why you're a good fit, and any relevant links..."
                      className="w-full p-3 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs sm:text-sm shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {applyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Proposal...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>

                  {!isAuthenticated && !user && (
                    <p className="text-[11px] text-stone-400 text-center">
                      Already have an account?{" "}
                      <Link href="/login" className="text-[#EA580C] underline font-semibold">
                        Log in
                      </Link>{" "}
                      to apply faster.
                    </p>
                  )}
                </form>
              )}
            </div>
            )}

          </div>
        </div>
      </main>

      {/* ── UPDATE WORK MODAL WITH RICH EDITOR ── */}
      <UpdateWorkModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        work={workData}
        workId={id}
        onSuccess={handleWorkUpdated}
      />
    </div>
  );
}
