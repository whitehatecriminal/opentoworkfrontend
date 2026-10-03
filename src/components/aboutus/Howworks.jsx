"use client";

import { ArrowRight, ArrowDown, Send, Search, CheckCircle2 } from "lucide-react";

export default function HowWorks() {
  const steps = [
    {
      num: "01",
      icon: Send,
      title: "Post What You Need",
      desc: "Tell people what you're looking for — whether it's a 2-hour helper down the street or a skilled software engineer.",
      accent: "bg-orange-50 text-[#EA580C] border-orange-200",
    },
    {
      num: "02",
      icon: Search,
      title: "Find the Right Match",
      desc: "Discover people and opportunities that fit your needs or skills through instant hyperlocal or remote discovery.",
      accent: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      num: "03",
      icon: CheckCircle2,
      title: "Connect & Get It Done",
      desc: "Connect directly with the right person, agree on terms, get the work done, and celebrate progress together.",
      accent: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
  ];

  return (
    <section className="py-10 sm:py-10 bg-white border-y border-[#E5DDD0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-xs font-bold uppercase tracking-wider text-[#EA580C] mb-3">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)]">
            Everything Starts With a Need
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-stone-600 font-[family-name:var(--font-jakarta)] max-w-xl mx-auto">
            A simple, intuitive 3-step loop designed to turn everyday needs and skills into completed work.
          </p>
        </div>

        {/* 3 Steps with Connected Arrows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-stretch">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <div key={idx} className="relative flex flex-col">
                <div className="bg-[#FAF7F2]/60 rounded-3xl border border-[#E5DDD0] p-8 sm:p-9 flex-1 flex flex-col justify-between shadow-[0_6px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-200">
                  <div>
                    {/* Step Number & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-4xl font-extrabold font-[family-name:var(--font-playfair)] text-stone-300">
                        {step.num}
                      </span>
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${step.accent}`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-xl font-bold text-[#1C1917] font-[family-name:var(--font-playfair)] mb-3">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-sm text-stone-600 leading-relaxed font-[family-name:var(--font-jakarta)]">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center gap-2 text-xs font-semibold text-stone-500">
                    <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                    <span>Step {step.num} of 03</span>
                  </div>
                </div>

                {/* Connecting Arrow for Desktop (between cards) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#E5DDD0] shadow-sm items-center justify-center text-stone-400">
                    <ArrowRight className="w-4 h-4 text-[#EA580C]" />
                  </div>
                )}

                {/* Connecting Arrow for Mobile (between cards) */}
                {idx < steps.length - 1 && (
                  <div className="flex md:hidden justify-center my-2 text-[#EA580C]">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#E5DDD0] flex items-center justify-center shadow-xs">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}