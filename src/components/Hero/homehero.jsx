"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function HomeHero() {
  const [activeTab, setActiveTab] = useState("findWork"); // 'findWork' | 'postWork'
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");


  return (
    <section className="relative overflow-hidden pt-5 pb-16 sm:pt-5 sm:pb-10">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-100/40 via-amber-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP PILL BADGE */}
        <div className="flex justify-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50/90 border border-orange-200/70 text-[#EA580C] text-xs sm:text-sm font-semibold shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#EA580C] animate-pulse" />
            <span>Got a Skill? Need a Skill? Find Your Match.</span>
          </div>
        </div>

        {/* HERO MAIN HEADLINE */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-4xl sm:text-2xl lg:text-6xl font-bold tracking-tight text-[#231f1d] font-[family-name:var(--font-playfair)] leading-[1.15]">
            Find What You <span className="text-[#EA580C] underline decoration-orange-300 decoration-wavy underline-offset-8">Need, Offer </span> <span className="text-stone-900">What You Do.</span>
          </h1>
          <p className="mt-5 text-base sm:text-sm lg:text-base text-stone-600 font-[family-name:var(--font-jakarta)] max-w-2xl mx-auto leading-relaxed">
            Find opportunities near you or work from anywhere with remote opportunities. Post what you need, 
            connect with the right people, and turn opportunities into action all in one place.
          </p>
        </div>

        {/* DUAL ACTION SWITCHER (Find Work vs Post Work) */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 rounded-2xl bg-stone-200/60 border border-stone-300/60 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("findWork")}
              className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === "findWork"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Search className="w-4 h-4 text-[#EA580C]" />
              <span>I Want to Find Opportunity</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("postWork")}
              className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === "postWork"
                  ? "bg-[#1e2329] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Zap className="w-4 h-4 text-orange-400" />
              <span>I Want to Post Opportunity</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE SEARCH & ACTION BAR */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#E5DDD0] p-3 sm:p-4 shadow-[0_15px_35px_rgba(0,0,0,0.06)] mb-10 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 items-center">
            
            {/* 1. Skill / Task Input */}
            <div className="md:col-span-5 relative flex items-center">
              <div className="absolute left-3.5 text-stone-400 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "findWork"
                    ? "e.g. 2-hr Helper, React Dev, Plumber..."
                    : "e.g. Need helper for lifting boxes..."
                }
                className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2]/60 rounded-2xl border border-stone-200/80 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:border-[#EA580C] focus:bg-white focus:ring-2 focus:ring-orange-500/15"
              />
            </div>

            {/* 2. Location Input */}
            <div className="md:col-span-4 relative flex items-center">
              <div className="absolute left-3.5 text-stone-400 pointer-events-none">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Current Area / City / Remote"
                className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2]/60 rounded-2xl border border-stone-200/80 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:border-[#EA580C] focus:bg-white focus:ring-2 focus:ring-orange-500/15"
              />
            </div>

            {/* 3. Action CTA Button */}
            <div className="md:col-span-3">
              {activeTab === "findWork" ? (
                <Link
                  href={`/signup?role=worker&query=${encodeURIComponent(searchQuery)}`}
                  className="w-full flex items-center  justify-center gap-2 py-3.5 px-5 bg-[#EA580C] hover:bg-[#C2410C] text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] no-underline"
                >
                  <span className="text-white! underline font-bold" >Explore Jobs</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>
              ) : (
                  <Link
                  href={`/signup?role=employer&task=${encodeURIComponent(searchQuery)}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-[#EA580C] hover:bg-[#C2410C] text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] no-underline"
                  >
                  <span className="text-white! underline font-bold! " >Post a Need</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}