"use client";

import { useState, useEffect } from "react";
import Editor from "@/src/components/postwork/editor";
import LocationMap from "@/src/components/postwork/map";
import { updateWork } from "@/src/api/work";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Globe,
  Laptop,
  Clock,
  Layers,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";

// Work Types list
const WORK_TYPES = [
  { id: "ONSITE", label: "On-Site", description: "At physical workplace", icon: Building2 },
  { id: "REMOTE", label: "Remote", description: "100% remote anywhere", icon: Globe },
  { id: "HYBRID", label: "Hybrid", description: "In-office & remote mix", icon: Laptop },
  { id: "FULLTIME", label: "Full Time", description: "Dedicated commitment", icon: Clock },
  { id: "CONTRACT", label: "Contract", description: "Fixed milestone project", icon: Layers },
];

// Status Options
const STATUS_OPTIONS = [
  { id: "OPEN", label: "Open (Accepting Bids)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "IN_PROGRESS", label: "In Progress", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { id: "COMPLETED", label: "Completed", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { id: "CLOSED", label: "Closed", color: "text-stone-700 bg-stone-100 border-stone-200" },
];

const DEFAULT_CATEGORY_ID = "056226a3-ea0e-44d6-932a-c94ee1e17075";

/**
 * Format date value to YYYY-MM-DD for date input
 */
function toInputDate(val) {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

/**
 * Calls PUT /api/v1/work/updatework/:id
 *
 * @param {Object} props
 * @param {Object} props.work - Work object to be updated
 * @param {string} props.workId - ID of the work
 * @param {boolean} props.isOpen - Whether screen is open
 * @param {() => void} props.onClose - Back / Close screen handler
 * @param {(updatedData: Object) => void} props.onSuccess - Callback after successful update
 */
export default function UpdateWorkModal({
  work,
  workId,
  isOpen,
  onClose,
  onSuccess,
}) {
  const targetId = workId || work?.id || work?._id;

  // Form Fields State initialized from work
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fees, setFees] = useState("");
  const [workType, setWorkType] = useState("ONSITE");
  const [status, setStatus] = useState("OPEN");
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY_ID);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [validUntil, setValidUntil] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Prefill all info whenever work changes or screen opens
  useEffect(() => {
    if (work && isOpen) {
      setTitle(work.title || work.workTitle || "");
      setDescription(
        typeof work.description === "string"
          ? work.description
          : work.description?.html || work.description?.text || ""
      );
      setFees(work.fees ?? work.budget ?? "");
      setWorkType(String(work.workType || "ONSITE").toUpperCase());
      setStatus(String(work.status || "OPEN").toUpperCase());
      setCategoryId(
        (typeof work.categoryId === "object" ? work.categoryId?.id : work.categoryId) ||
          (typeof work.category === "object" ? work.category?.id : work.category) ||
          DEFAULT_CATEGORY_ID
      );
      setLatitude(work.latitude || work.lat || "");
      setLongitude(work.longitude || work.lon || work.lng || "");
      setFullAddress(work.fullAddress || work.location || work.address || "");
      setValidUntil(toInputDate(work.validUntil));
      setErrorMessage("");
      setSuccessMessage("");
      setErrors({});
    }
  }, [work, isOpen]);

  // Handle Escape key to close screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  // Validation
  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = "Work title is required.";
    }
    if (!description.trim() || description === "<p></p>") {
      errs.description = "Detailed work description is required.";
    }
    if (!fees || Number(fees) <= 0) {
      errs.fees = "Please enter a valid compensation/fees amount.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Location select from Map
  const handleLocationChange = ({ latitude: lat, longitude: lng, address }) => {
    setLatitude(lat);
    setLongitude(lng);
    if (address && !fullAddress) {
      setFullAddress(address);
    }
  };

  // Form Submission calling PUT /updatework/:id
  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    setErrorMessage("");
    setSuccessMessage("");

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!targetId) {
      setErrorMessage("Missing work project ID for update.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        fees: Number(fees),
        workType,
        status,
        categoryId: categoryId || DEFAULT_CATEGORY_ID,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        fullAddress: fullAddress.trim(),
        location: fullAddress.trim(),
        address: fullAddress.trim(),
        ...(validUntil ? { validUntil: new Date(validUntil).toISOString() } : {}),
      };

      // Call PUT /api/v1/work/updatework/:id
      const response = await updateWork(targetId, payload);
      const updatedWork = response?.data || response?.work || response || payload;

      setSuccessMessage("Work project updated successfully!");
      onSuccess?.(updatedWork);

      setTimeout(() => {
        onClose?.();
      }, 1000);
    } catch (err) {
      console.error("Failed to update work:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update work project. Please try again.";
      setErrorMessage(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen min-h-screen overflow-y-auto bg-[#FAF7F2] text-[#1C1917] flex flex-col animate-in fade-in duration-200">
      
      {/* ── 1. STICKY TOP FULL-WIDTH NAVBAR ── */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DDD0] shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Back button & Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F4EFE6] border border-[#E5DDD0] text-stone-700 text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 text-orange-600" />
              <span>Back</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Editing Work Project
                </span>
                {targetId && (
                  <span className="text-[10px] font-mono text-stone-500 bg-white px-2 py-0.5 rounded border border-[#E5DDD0]">
                    ID: {String(targetId).slice(-8)}
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-xl font-bold text-stone-900 truncate font-[family-name:var(--font-playfair)]">
                {title || "Update Work Project"}
              </h1>
            </div>
          </div>

          {/* Action buttons on Header */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-700 bg-white border border-[#E5DDD0] hover:bg-[#F4EFE6] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. FULL-SCREEN SCROLLABLE CONTENT AREA ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Alerts */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm flex items-center gap-3 shadow-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Update Error</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Success!</p>
              <p className="mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Core Project Details */}
          <div className="bg-white rounded-3xl border border-[#E5DDD0] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 font-[family-name:var(--font-playfair)]">
                    Project Overview & Compensation
                  </h2>
                  <p className="text-xs text-stone-500">
                    Define the work title, work arrangement, status, and budget.
                  </p>
                </div>
              </div>
            </div>

            {/* Work Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                Work Project Title <span className="text-orange-600">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full Stack Next.js & Node.js Developer for Marketplace"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl text-stone-900 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:font-normal"
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Mode of Work Options */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                Mode of Work
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {WORK_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = workType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setWorkType(type.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                          : "bg-[#FAF7F2] text-stone-700 hover:bg-[#F4EFE6] border-[#E5DDD0]"
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1.5" />
                      <span className="font-bold">{type.label}</span>
                      <span className="text-[10px] opacity-75 hidden sm:block text-center mt-0.5">
                        {type.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work Status Options */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                Work Project Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = status === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStatus(opt.id)}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : `${opt.color} hover:opacity-85`
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fees & Deadline Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                  Compensation / Budget (₹) <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full pl-9 pr-4 py-3 bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl text-stone-900 text-base font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-[family-name:var(--font-jakarta)]"
                  />
                </div>
                {errors.fees && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.fees}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                  Valid Until (Deadline Date)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Full Rich Text Editor for Description */}
          <div className="bg-white rounded-3xl border border-[#E5DDD0] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
              <div>
                <h2 className="text-lg font-bold text-stone-900 font-[family-name:var(--font-playfair)]">
                  Work Description & Detailed Deliverables <span className="text-orange-600">*</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Format headings, bullet points, numbered lists, links, bold, and italics using the TipTap editor.
                </p>
              </div>
            </div>

            <Editor
              value={description}
              onChange={(newHtml) => setDescription(newHtml)}
              placeholder="Provide complete deliverables, responsibilities, prerequisites, or milestones..."
              minHeight="320px"
              className="border-[#E5DDD0] rounded-2xl"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Card 3: Location and Leaflet Map Picker */}
          <div className="bg-white rounded-3xl border border-[#E5DDD0] p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 font-[family-name:var(--font-playfair)]">
                    Work Location & Map Pinpoint
                  </h2>
                  <p className="text-xs text-stone-500">
                    Search places, use GPS, or click on the map to pin accurate coordinates.
                  </p>
                </div>
              </div>
            </div>

            {/* Address Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                Workplace Address / Description
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="e.g. Cyber City, Sector 24, Gurugram, Haryana, India"
                  className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Interactive Leaflet Location Map */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Interactive Map Pinpoint
                </span>
                {latitude && longitude && (
                  <span className="text-[11px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-[#E5DDD0]">
                    Coordinates: {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
                  </span>
                )}
              </div>

              <LocationMap
                latitude={latitude ? Number(latitude) : 28.6139}
                longitude={longitude ? Number(longitude) : 77.209}
                onLocationChange={handleLocationChange}
                height="320px"
                className="rounded-2xl border border-[#E5DDD0] overflow-hidden shadow-xs"
              />
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-semibold text-stone-700 bg-white border border-[#E5DDD0] hover:bg-[#F4EFE6] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Update Work</span>
                  </>
                )}
              </button>
            </div>
        </form>
      </main>
    </div>
  );
}
