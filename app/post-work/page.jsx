"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/src/components/Navbar";
import UserNavbar from "@/src/components/User/usernavbar";
import Editor from "@/src/components/postwork/editor";
import LocationMap from "@/src/components/postwork/map";
import { useAuthStore } from "@/src/store/authstore";
import { createWork } from "@/src/api/work";
import {
  Briefcase,
  MapPin,
  Calendar,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Globe,
  Clock,
  Laptop,
  Layers,
  ArrowRight,
  Info,
  Loader2,
} from "lucide-react";

// Work Types specified by user
const WORK_TYPES = [
  {
    id: "ONSITE",
    label: "On-Site",
    description: "Work performed physically at the specified workplace location.",
    icon: Building2,
  },
  {
    id: "REMOTE",
    label: "Remote",
    description: "Work performed 100% remotely from anywhere.",
    icon: Globe,
  },
  {
    id: "HYBRID",
    label: "Hybrid",
    description: "Mix of in-office and remote collaboration.",
    icon: Laptop,
  },
  {
    id: "FULLTIME",
    label: "Full Time",
    description: "Dedicated standard full-time commitment.",
    icon: Clock,
  },
  {
    id: "CONTRACT",
    label: "Contract",
    description: "Fixed duration or milestone-based project contract.",
    icon: Layers,
  },
];

// Default Category ID provided in requirements
const DEFAULT_CATEGORY_ID = "056226a3-ea0e-44d6-932a-c94ee1e17075";

export default function PostWorkPage() {
  const { user, isAuthenticated } = useAuthStore();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fees, setFees] = useState("");
  const [workType, setWorkType] = useState("ONSITE");
  const [categoryId] = useState(DEFAULT_CATEGORY_ID);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [validUntil, setValidUntil] = useState("");

  // UI / Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Minimum date selectable is today
  const todayDateString = new Date().toISOString().split("T")[0];

  // Map location selection handler
  const handleLocationSelect = ({ latitude: lat, longitude: lng, address, fullAddress: newFullAddress }) => {
    setLatitude(lat);
    setLongitude(lng);
    const resolvedAddress = newFullAddress || address;
    if (resolvedAddress) {
      setFullAddress(resolvedAddress);
    }
    setValidationErrors((prev) => ({
      ...prev,
      location: undefined,
      fullAddress: undefined,
    }));
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = "Work title is required.";
    } else if (title.trim().length < 5) {
      errors.title = "Title should be at least 5 characters.";
    }

    // Clean check for empty HTML description
    const strippedDesc = description.replace(/<[^>]*>/g, "").trim();
    if (!description || !strippedDesc) {
      errors.description = "Work description is required in detail.";
    }

    if (!fees || Number(fees) <= 0) {
      errors.fees = "Please enter a valid compensation/fees amount.";
    }

    if (!workType) {
      errors.workType = "Please select a work type.";
    }

    if (!latitude || !longitude) {
      errors.location = "Please select your location on the map or use GPS.";
    }

    if (!fullAddress.trim()) {
      errors.fullAddress = "Workplace full address is required.";
    }

    if (validUntil) {
      const selectedTime = new Date(validUntil).getTime();
      const nowTime = new Date().setHours(0, 0, 0, 0);
      if (selectedTime < nowTime) {
        errors.validUntil = "Valid until date must be today or in the future.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    if (!isAuthenticated && !user) {
      setErrorMessage(
        "You must be logged in to post work. Please log in to publish your work opportunity."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(), // HTML format
        fees: Number(fees),
        workType,
        categoryId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        fullAddress: fullAddress.trim(),
        location: fullAddress.trim(),
        address: fullAddress.trim(),
        ...(validUntil ? { validUntil: new Date(validUntil).toISOString() } : {}),
      };

      const response = await createWork(payload);
      setSuccessData(response);

      // Reset form on success
      setTitle("");
      setDescription("");
      setFees("");
      setValidUntil("");
      setLatitude("");
      setLongitude("");
      setFullAddress("");
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to post work. Please try again.";
      setErrorMessage(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col font-sans">
      {/* ── NAVBAR ───────────────────────────────────────────── */}
      {isAuthenticated || user ? <UserNavbar /> : <Navbar />}

      {/* ── HEADER BANNER ────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-[#E5DDD0]/70 bg-gradient-to-b from-[#F4EFE6]/90 via-[#FAF7F2] to-[#FAF7F2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#EA580C] text-xs font-semibold shadow-2xs mb-4">
            <span>Create Opportunity</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)] leading-tight">
            Post a New <span className="text-[#EA580C]">Work Opportunity</span>
          </h1>
          <p className="mt-3 text-stone-600 max-w-2xl text-sm sm:text-base leading-relaxed">
            Connect with skilled contractors, freelancers, and professionals. 
            Define the scope, pin your location on the map, and start receiving applications.
          </p>

          {/* Authentication notice if not logged in */}
          {!isAuthenticated && !user && (
            <div className="mt-5 flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="flex-1">
                <span>You are currently not signed in. You can draft your posting, but you must </span>
                <Link href="/login" className="font-semibold underline text-amber-950 hover:text-[#EA580C]">
                  sign in to publish
                </Link>
                <span>.</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── MAIN FORM CONTAINER ──────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Success Modal / Banner */}
        {successData && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-900">
                  Work Opportunity Posted Successfully!
                </h3>
                <p className="mt-1 text-sm text-emerald-800">
                  Your work project has been published and is now visible to candidates on Open To Work.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/explorework"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EA580C] text-white hover:bg-[#C2410C] text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                  >
                    <span>View in Explore Work</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSuccessData(null)}
                    className="px-4 py-2 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 text-xs sm:text-sm font-medium transition-colors"
                  >
                    Post Another Work
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* ── CARD 1: BASIC INFORMATION ── */}
          <div className="p-6 sm:p-8 rounded-2xl border border-[#E5DDD0] bg-white shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-[#F0EAE1]">
              <div className="p-2 rounded-lg bg-[#F4EFE6] text-[#EA580C]">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1C1917] tracking-tight">
                  1. Basic Details
                </h2>
                <p className="text-xs text-stone-500">
                  Provide the core job title, compensation, and validity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Title */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label htmlFor="work-title" className="text-xs sm:text-sm font-semibold text-stone-800">
                  Work Title<span className="text-red-500">*</span>
                </label>
                <input
                  id="work-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (validationErrors.title) {
                      setValidationErrors((prev) => ({ ...prev, title: undefined }));
                    }
                  }}
                  placeholder="e.g. Full-Stack Developer for SaaS Dashboard, Plumber Needed for Commercial Site..."
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all shadow-2xs ${
                    validationErrors.title
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-[#E5DDD0] focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15"
                  }`}
                />
                {validationErrors.title && (
                  <span className="text-xs text-red-600 font-medium">
                    {validationErrors.title}
                  </span>
                )}
              </div>

              {/* Fees */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="work-fees" className="text-xs sm:text-sm font-semibold text-stone-800">
                  Fees / Budget (₹)<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    id="work-fees"
                    type="number"
                    min="1"
                    step="1"
                    value={fees}
                    onChange={(e) => {
                      setFees(e.target.value);
                      if (validationErrors.fees) {
                        setValidationErrors((prev) => ({ ...prev, fees: undefined }));
                      }
                    }}
                    placeholder="e.g. 25000"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all shadow-2xs ${
                      validationErrors.fees
                        ? "border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-[#E5DDD0] focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15"
                    }`}
                  />
                </div>
                {validationErrors.fees ? (
                  <span className="text-xs text-red-600 font-medium">
                    {validationErrors.fees}
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400">
                    Compensation amount offered for this work.
                  </span>
                )}
              </div>

              {/* Valid Until */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="valid-until" className="text-xs sm:text-sm font-semibold text-stone-800">
                  Valid Until
                </label>
                <div className="relative">
                  <input
                    id="valid-until"
                    type="date"
                    min={todayDateString}
                    value={validUntil}
                    onChange={(e) => {
                      setValidUntil(e.target.value);
                      if (validationErrors.validUntil) {
                        setValidationErrors((prev) => ({ ...prev, validUntil: undefined }));
                      }
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-stone-900 focus:outline-none transition-all shadow-2xs ${
                      validationErrors.validUntil
                        ? "border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-[#E5DDD0] focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15"
                    }`}
                  />
                </div>
                {validationErrors.validUntil ? (
                  <span className="text-xs text-red-600 font-medium">
                    {validationErrors.validUntil}
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400">
                    Date after which this posting expires.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── CARD 2: WORK TYPE SELECTION ── */}
          <div className="p-6 sm:p-8 rounded-2xl border border-[#E5DDD0] bg-white shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-[#F0EAE1]">
              <div className="p-2 rounded-lg bg-[#F4EFE6] text-[#EA580C]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1C1917] tracking-tight">
                  2. Work Type<span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Select mode of work.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {WORK_TYPES.map((type) => {
                const IconComponent = type.icon;
                const isSelected = workType === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setWorkType(type.id);
                      if (validationErrors.workType) {
                        setValidationErrors((prev) => ({ ...prev, workType: undefined }));
                      }
                    }}
                    className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[#EA580C] bg-orange-50/50 shadow-xs ring-2 ring-[#EA580C]/15"
                        : "border-[#E5DDD0] hover:border-[#D0C5B4] bg-white hover:bg-[#FAF7F2]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected
                            ? "bg-[#EA580C] text-white"
                            : "bg-[#F4EFE6] text-stone-600"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-[#EA580C] text-white"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {type.id}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-stone-900">
                      {type.label}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
            {validationErrors.workType && (
              <span className="block mt-2 text-xs text-red-600 font-medium">
                {validationErrors.workType}
              </span>
            )}
          </div>

          {/* ── CARD 3: WORK DESCRIPTION (HTML FORMAT) ── */}
          <div className="p-6 sm:p-8 rounded-2xl border border-[#E5DDD0] bg-white shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#F0EAE1]">
              <div className="p-2 rounded-lg bg-[#F4EFE6] text-[#EA580C]">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#1C1917] tracking-tight">
                    3. Description<span className="text-red-500">*</span>
                  </h2>
                </div>
                <p className="text-xs text-stone-500">
                  Write detailed requirements, responsibilities, deliverables, and expectations.
                </p>
              </div>
            </div>

            {/* TipTap Rich Text Editor */}
            <Editor
              value={description}
              onChange={(html) => {
                setDescription(html);
                if (validationErrors.description) {
                  setValidationErrors((prev) => ({
                    ...prev,
                    description: undefined,
                  }));
                }
              }}
              placeholder="Outline project deliverables, required skills, tools, milestones, and instructions..."
              minHeight="220px"
              className={validationErrors.description ? "border-red-400 ring-2 ring-red-100" : ""}
            />

            {validationErrors.description && (
              <span className="block mt-2 text-xs text-red-600 font-medium">
                {validationErrors.description}
              </span>
            )}
          </div>

          {/* ── CARD 4: LOCATION ON MAP & FULL ADDRESS ── */}
          <div className="p-6 sm:p-8 rounded-2xl border border-[#E5DDD0] bg-white shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#F0EAE1]">
              <div className="p-2 rounded-lg bg-[#F4EFE6] text-[#EA580C]">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-[#1C1917] tracking-tight">
                  4. Location & Workplace Address<span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Pin your exact location on the map, search place, or click &quot;Use My Location&quot;.
                </p>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <LocationMap
              latitude={latitude ? Number(latitude) : undefined}
              longitude={longitude ? Number(longitude) : undefined}
              onLocationChange={handleLocationSelect}
              height="340px"
            />

            {validationErrors.location && (
              <span className="block mt-2 text-xs text-red-600 font-medium">
                {validationErrors.location}
              </span>
            )}

            {/* Full Workplace Address Input */}
            <div className="flex flex-col gap-1.5 mt-5 pt-5 border-t border-[#F0EAE1]">
              <div className="flex items-center justify-between">
                <label htmlFor="full-address-input" className="text-xs sm:text-sm font-semibold text-stone-800">
                  Full Workplace Address<span className="text-red-500">*</span>
                </label>
                {fullAddress && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Location Captured</span>
                  </span>
                )}
              </div>
              <textarea
                id="full-address-input"
                rows={2}
                value={fullAddress}
                onChange={(e) => {
                  setFullAddress(e.target.value);
                  if (validationErrors.fullAddress) {
                    setValidationErrors((prev) => ({ ...prev, fullAddress: undefined }));
                  }
                }}
                placeholder="e.g. Building 4, Cyber City, DLF Phase 2, Gurugram, Haryana..."
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all shadow-2xs resize-none ${
                  validationErrors.fullAddress
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-[#E5DDD0] focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15"
                }`}
              />
              {validationErrors.fullAddress ? (
                <span className="text-xs text-red-600 font-medium">
                  {validationErrors.fullAddress}
                </span>
              ) : (
                <span className="text-[11px] text-stone-400">
                  Clicking &quot;Use My Location&quot; on the map will automatically replace this with your current location, or you can edit/type manually.
                </span>
              )}
            </div>

            {/* Manual Lat & Lng Input Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#F0EAE1]">
              <div className="flex flex-col gap-1">
                <label htmlFor="latitude-input" className="text-xs font-semibold text-stone-700">
                  Latitude
                </label>
                <input
                  id="latitude-input"
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 28.613939"
                  className="px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-[#E5DDD0] bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="longitude-input" className="text-xs font-semibold text-stone-700">
                  Longitude
                </label>
                <input
                  id="longitude-input"
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 77.209021"
                  className="px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-[#E5DDD0] bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15"
                />
              </div>
            </div>
          </div>

          {/* ── CARD 5: CATEGORY INFO (PRESET) ── */}
          <div className="px-6 py-4 rounded-xl border border-[#E5DDD0] bg-[#FAF7F2] flex items-center justify-between text-xs text-stone-600">
            <span className="font-medium">Category ID:</span>
            <code className="text-[11px] font-mono bg-white px-2.5 py-1 rounded-md border border-[#E5DDD0] text-stone-800">
              {categoryId}
            </code>
          </div>

          {/* ── SUBMIT BUTTON SECTION ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-12">
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel and Return
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publishing Opportunity...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Publish Work Opportunity</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}