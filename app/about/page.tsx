"use client";

import { useState } from "react";
import Navbar from "@/src/components/Navbar";
import HowWorks from "@/src/components/aboutus/Howworks";
import Link from "next/link";
import {
  Search,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Globe2,
  CheckCircle2,
  Wrench,
  Paintbrush,
  Code2,
  Truck,
  GraduationCap,
  Sparkle,
  Compass,
  HeartHandshake,
} from "lucide-react";

export default function AboutPage() {
  const [activeWayTab, setActiveWayTab] = useState("find"); // 'find' | 'post'
  const [selectedMapFilter, setSelectedMapFilter] = useState("all");

  const categories = [
    {
      icon: Truck,
      name: "Instant Local & Moving",
      count: "140+ nearby tasks",
      desc: "2-hour apartment helpers, box lifting, quick deliveries, and on-demand shifting.",
      badge: "Hyperlocal",
      color: "text-amber-600 bg-amber-50 border-amber-200/60",
    },
    {
      icon: Code2,
      name: "Software & Engineering",
      count: "320+ opportunities",
      desc: "Full-stack devs, React/Node engineers, mobile developers, and DevOps experts.",
      badge: "Remote / Hybrid",
      color: "text-blue-600 bg-blue-50 border-blue-200/60",
    },
    {
      icon: Wrench,
      name: "Trades & Home Services",
      count: "85+ active pros",
      desc: "Certified electricians, plumbers, carpenters, and appliance repair specialists.",
      badge: "On-Demand",
      color: "text-orange-600 bg-orange-50 border-orange-200/60",
    },
    {
      icon: Paintbrush,
      name: "Creative & UI/UX Design",
      count: "190+ contracts",
      desc: "Mobile UI/UX, brand identity, Figma prototypes, and product animations.",
      badge: "Contract",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
    },
    {
      icon: GraduationCap,
      name: "Tutoring & Education",
      count: "65+ listings",
      desc: "Language coaches, math & science tutors, and coding bootcamp mentors.",
      badge: "Flexible",
      color: "text-purple-600 bg-purple-50 border-purple-200/60",
    },
    {
      icon: Sparkle,
      name: "Events & Hospitality",
      count: "45+ gigs",
      desc: "Weekend event support, catering crew, setup coordinators, and hosts.",
      badge: "Hourly",
      color: "text-rose-600 bg-rose-50 border-rose-200/60",
    },
  ];

  const nearbyOpportunities = [
    {
      id: "near-1",
      title: "Need 1 helper for apartment box lifting (2 Hours)",
      distance: "1.2 km away",
      area: "Green Park West",
      time: "Today at 4:30 PM",
      payout: "$50 ($25/hr)",
      urgent: true,
      category: "moving",
      coords: { x: "28%", y: "42%" },
    },
    {
      id: "near-2",
      title: "Urgent AC repair & electrical socket check",
      distance: "2.8 km away",
      area: "Sector 44 Hub",
      time: "Within 1 hour",
      payout: "$45 fixed",
      urgent: true,
      category: "repair",
      coords: { x: "65%", y: "30%" },
    },
    {
      id: "near-3",
      title: "Part-time barista & front-counter support for 3 days",
      distance: "3.5 km away",
      area: "Downtown Roast Café",
      time: "Starts tomorrow 9:00 AM",
      payout: "$22/hr",
      urgent: false,
      category: "events",
      coords: { x: "48%", y: "68%" },
    },
    {
      id: "near-4",
      title: "Studio setup & camera assistant for afternoon shoot",
      distance: "4.1 km away",
      area: "Creative Arts Block",
      time: "Saturday 1:00 PM",
      payout: "$120 (4 hrs)",
      urgent: false,
      category: "creative",
      coords: { x: "78%", y: "72%" },
    },
  ];

  const remoteOpportunities = [
    {
      role: "Senior React & Next.js Developer",
      company: "CloudScale HQ",
      type: "Full-Time Remote",
      salary: "$110,000 - $140,000 / yr",
      location: "Worldwide (Any timezone)",
      tags: ["Next.js", "TypeScript", "Tailwind", "Node.js"],
    },
    {
      role: "Lead UI/UX Mobile App Designer",
      company: "FinFlow Systems",
      type: "3-Month Contract",
      salary: "$4,500 / month",
      location: "Remote (US/EU hours)",
      tags: ["Figma", "Design Systems", "Prototyping"],
    },
    {
      role: "Technical Content & Technical Writer",
      company: "DevRel Labs",
      type: "Part-Time / Milestone",
      salary: "$60 / hr",
      location: "Remote",
      tags: ["Docs", "API Guides", "React"],
    },
  ];

  const whyChooseUs = [
    {
      icon: Zap,
      title: "Hyperlocal & Instant Matching",
      desc: "For quick tasks like moving boxes or emergency repairs, get connected with verified people 10 minutes away from your doorstep.",
    },
    {
      icon: Globe2,
      title: "Global Remote Career Reach",
      desc: "When you have digital skills, geography shouldn't limit you. Apply to contract and full-time remote roles across the globe.",
    },
    {
      icon: ShieldCheck,
      title: "Protected Payouts & Escrow",
      desc: "Every contract and hourly task is backed by secure payments. Work completed is always guaranteed work paid.",
    },
    {
      icon: HeartHandshake,
      title: "Equal Dignity for Every Skill",
      desc: "We believe a 2-hour moving gig deserves the exact same respect, transparency, and safety as an executive engineering role.",
    },
  ];

  const filteredNearby =
    selectedMapFilter === "all"
      ? nearbyOpportunities
      : nearbyOpportunities.filter((item) =>
          selectedMapFilter === "urgent" ? item.urgent : true
        );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO INTRO SECTION */}
        <section className="relative overflow-hidden pt-5 pb-16 sm:pt-5 sm:pb-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-100/40 via-amber-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#EA580C] text-xs sm:text-sm font-semibold mb-6 shadow-xs">
              <span>About Open To Work</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)] leading-[1.15]">
              Rethinking How the World <br />
              <span className="text-[#EA580C] underline decoration-orange-300 decoration-wavy underline-offset-8">
                Works, Hires, and Connects.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-sm lg:text-base text-stone-600 font-[family-name:var(--font-jakarta)] max-w-2xl mx-auto leading-relaxed">
              Open To Work was founded on a simple truth: <strong>opportunity should never be out of reach</strong>. Whether you&apos;re looking for someone to help with a task, offering a skill or service, searching for your next opportunity, or simply need something done — <strong>Open To Work brings people together</strong> based on what they need and what they can offer.
            </p>
          </div>
        </section>

        {/* 2. HOW IT WORKS SECTION */}
        <HowWorks />

        {/* 3. TWO WAYS TO USE IT (Find Opportunities | Post Opportunities) */}
        <section className="py-10 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
              What Are You Looking For?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)] mt-2">
              Discover local and remote opportunities that match your skills, interests, and availability.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 font-[family-name:var(--font-jakarta)]">
              Have something to offer or need something done? Find the right people to make it happen.
            </p>

            {/* Toggle Pill */}
            <div className="inline-flex p-1.5 rounded-2xl bg-stone-200/70 border border-stone-300/60 shadow-inner mt-8">
              <button
                type="button"
                onClick={() => setActiveWayTab("find")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeWayTab === "find"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Search className="w-4 h-4 text-[#EA580C]" />
                <span>1. Find Opportunities</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWayTab("post")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeWayTab === "post"
                    ? "bg-[#1e2329] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Zap className="w-4 h-4 text-orange-400" />
                <span>2. Post Opportunities</span>
              </button>
            </div>
          </div>

          {/* Dynamic Content Card */}
          <div className="bg-white rounded-3xl border border-[#E5DDD0] p-8 sm:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all">
            {activeWayTab === "find" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-[#EA580C] mb-4">
                    <Compass className="w-3.5 h-3.5" /> For Freelancers, Workers & Professionals
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-playfair)] mb-4 leading-snug">
                    Turn Your Free Hours and Expertise into Direct Income.
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-6 font-[family-name:var(--font-jakarta)]">
                    Browse active local tasks near your GPS location or apply for remote engineering, design, and writing contracts. No hidden platform paywalls.
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-stone-700">
                        <strong>Instant Hyperlocal Alerts:</strong> Get notified when someone nearby needs helper assistance today.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-stone-700">
                        <strong>Transparent Rates:</strong> See exact hourly or fixed prices upfront before applying.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-stone-700">
                        <strong>Instant Reputation:</strong> Build verified ratings and client reviews to win higher-paying opportunities.
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/signup?role=worker"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all no-underline"
                  >
                    <span>Start Finding Work</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DDD0] p-6 space-y-3.5 shadow-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
                    Live Feed Preview
                  </span>
                  <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-bold rounded mb-1 border border-amber-200">
                        2-Hour Instant Gig
                      </span>
                      <h4 className="text-sm font-bold text-stone-900">Apartment Furniture Lifting</h4>
                      <p className="text-xs text-stone-500">1.2 km away • Today 4:00 PM</p>
                    </div>
                    <span className="text-sm font-extrabold text-[#EA580C]">$25/hr</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded mb-1 border border-blue-200">
                        Full-Time Career
                      </span>
                      <h4 className="text-sm font-bold text-stone-900">Senior React / Next.js Engineer</h4>
                      <p className="text-xs text-stone-500">Remote • Tech Corp</p>
                    </div>
                    <span className="text-sm font-extrabold text-stone-900">$120k/yr</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-xs font-bold text-orange-400 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" /> For Individuals, Startups & Companies
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-playfair)] mb-4 leading-snug">
                    Post What You Need in Under 60 Seconds.
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-6 font-[family-name:var(--font-jakarta)]">
                    Need extra hands to shift heavy goods in 30 minutes, an electrician to fix a circuit, or a software engineer for your startup? Publish your request and receive verified bids instantly.
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-stone-700">
                        <strong>Zero Bureaucracy:</strong> No lengthy recruitment agency cycles. Post what you need and set your budget.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-stone-700">
                        <strong>Nearby Availability:</strong> Local workers around your block receive real-time notifications.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-stone-700">
                        <strong>Safe Release:</strong> Funds are only released when you confirm the work is completed to satisfaction.
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/signup?role=employer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1e2329] hover:bg-slate-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all no-underline"
                  >
                    <span>Post Your First Need</span>
                    <ArrowRight className="w-4 h-4 text-orange-400" />
                  </Link>
                </div>

                <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DDD0] p-6 space-y-3 shadow-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
                    Quick Post Preview
                  </span>
                  <div className="p-4 rounded-xl bg-white border border-stone-200">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-orange-600">
                      <Zap className="w-4 h-4" /> Live Match Active
                    </div>
                    <p className="text-sm font-semibold text-stone-800">
                      &quot;Need 2 helpers for unloading delivery van today at 5 PM. Rate: $30/hr.&quot;
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                      <span>4 nearby workers active</span>
                      <span className="text-emerald-600 font-bold">Responses in ~12 mins</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. CATEGORIES SECTION */}
        <section className="bg-[#F4EFE6]/60 py-16 sm:py-24 border-y border-[#E5DDD0]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                Explore Skills & Roles
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)] mt-2">
                Popular Categories of Work
              </h2>
              <p className="mt-3 text-sm sm:text-base text-stone-600 font-[family-name:var(--font-jakarta)]">
                From 2-hour physical assistance to complex high-tech contracts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, idx) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-[#E5DDD0] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${cat.color}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200/60">
                          {cat.badge}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-stone-900 mb-2 font-[family-name:var(--font-playfair)]">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed font-[family-name:var(--font-jakarta)]">
                        {cat.desc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-500">{cat.count}</span>
                      <Link
                        href="/signup"
                        className="font-bold text-[#EA580C] hover:text-[#C2410C] hover:underline"
                      >
                        Explore →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. OPPORTUNITIES NEAR YOU + MAP SECTION */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
              Hyperlocal Live Matching
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)] mt-2">
              Opportunities Near You
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 font-[family-name:var(--font-jakarta)]">
              Real-time map visualization of on-demand tasks and helpers active in your neighborhood.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5DDD0] p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Map Interactive Visual Representation */}
            <div className="lg:col-span-7 relative w-full h-[380px] sm:h-[440px] rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden shadow-inner flex items-center justify-center">
              {/* Map Graphic Background Simulation */}
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  backgroundImage: `
                    radial-gradient(#d6cebe 1px, transparent 1px),
                    linear-gradient(to right, rgba(229, 221, 208, 0.4) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(229, 221, 208, 0.4) 1px, transparent 1px)
                  `,
                  backgroundSize: "24px 24px, 48px 48px, 48px 48px",
                }}
              />

              {/* Map Roads Simulation Lines */}
              <svg className="absolute inset-0 w-full h-full text-stone-300/80 stroke-current" fill="none">
                <path d="M-20,120 Q180,180 340,90 T600,240" strokeWidth="6" />
                <path d="M120,-20 Q160,200 280,300 T420,500" strokeWidth="4" />
                <path d="M400,0 Q320,180 500,320" strokeWidth="5" />
              </svg>

              {/* Center User Location Pin */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 animate-ping absolute inset-0" />
                  <div className="w-12 h-12 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-lg border-2 border-white relative z-10">
                    <MapPin className="w-6 h-6" />
                  </div>
                </div>
                <span className="mt-2 px-3 py-1 bg-stone-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow">
                  You are here (Live Area)
                </span>
              </div>

              {/* Nearby Opportunity Pins */}
              {filteredNearby.map((item) => (
                <div
                  key={item.id}
                  className="absolute z-20 group cursor-pointer transition-transform hover:scale-110"
                  style={{ left: item.coords.x, top: item.coords.y }}
                >
                  <div className="w-9 h-9 rounded-full bg-white border-2 border-[#EA580C] shadow-md flex items-center justify-center text-[#EA580C]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-stone-900 text-white rounded-xl text-xs shadow-xl pointer-events-none z-30">
                    <p className="font-bold line-clamp-1">{item.title}</p>
                    <p className="text-orange-400 font-semibold">{item.payout} • {item.distance}</p>
                  </div>
                </div>
              ))}

              <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Hyperlocal GPS Radius: 5 km</span>
              </div>
            </div>

            {/* Opportunity Listing Sidebar */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900 font-[family-name:var(--font-playfair)]">
                  Active Nearby Needs ({filteredNearby.length})
                </h3>
                <div className="flex gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedMapFilter("all")}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                      selectedMapFilter === "all"
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMapFilter("urgent")}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                      selectedMapFilter === "urgent"
                        ? "bg-red-600 text-white"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    🔥 Urgent Only
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredNearby.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl bg-[#FAF7F2]/80 border border-[#E5DDD0] hover:bg-white hover:border-[#EA580C]/40 transition-all shadow-xs group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600">
                        <MapPin className="w-3 h-3 text-[#EA580C]" /> {job.distance} ({job.area})
                      </span>
                      <span className="text-xs font-extrabold text-[#EA580C]">{job.payout}</span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#EA580C] transition-colors leading-snug">
                      {job.title}
                    </h4>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-200/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {job.time}
                      </span>
                      <Link
                        href="/signup"
                        className="font-bold text-[#EA580C] hover:underline"
                      >
                        Apply →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. REMOTE OPPORTUNITIES SECTION */}
        <section className="bg-white py-16 sm:py-24 border-y border-[#E5DDD0]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                Work From Anywhere
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)] mt-2">
                Global Remote Opportunities
              </h2>
              <p className="mt-3 text-sm sm:text-base text-stone-600 font-[family-name:var(--font-jakarta)]">
                Match with startups and multinational teams seeking top digital and technical talent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {remoteOpportunities.map((rem, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF7F2]/70 rounded-3xl border border-[#E5DDD0] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/70">
                        {rem.type}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">{rem.company}</span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900 mb-2 font-[family-name:var(--font-playfair)]">
                      {rem.role}
                    </h3>

                    <p className="text-sm font-extrabold text-stone-900 mb-3">{rem.salary}</p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {rem.tags.map((tag, tagIdx) => (
                        <span
                          key={tagIdx}
                          className="px-2 py-0.5 rounded-md bg-white text-stone-600 text-[11px] font-medium border border-stone-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/signup"
                    className="w-full py-2.5 text-center rounded-xl bg-white hover:bg-orange-50 border border-[#E5DDD0] text-stone-900 hover:text-[#EA580C] text-xs font-bold transition-all no-underline"
                  >
                    View Role & Apply
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. WHY OPENTOWORK */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
              The OpenToWork Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)] mt-2">
              Why Open To Work?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 font-[family-name:var(--font-jakarta)]">
              Built on transparency, speed, and fairness for every type of talent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-[#E5DDD0] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col items-start"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-[#EA580C] flex items-center justify-center mb-5">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mb-2 font-[family-name:var(--font-playfair)]">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-[family-name:var(--font-jakarta)]">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. FINAL CTA BANNER */}
        <section className="py-16 sm:py-20 bg-[#FAF7F2]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#1e2329] text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] tracking-tight mb-4">
                Ready to find work or post your need?
              </h2>
              <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto mb-8 font-[family-name:var(--font-jakarta)]">
                Join thousands of neighbors, freelancers, and businesses turning needs into completed work every single day.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 no-underline"
                >
                  <span>Get Started for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/20 transition-all no-underline"
                >
                  Log In to Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
