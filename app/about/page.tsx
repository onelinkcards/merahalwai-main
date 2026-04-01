import Navbar from "@/components/layout/Navbar";
import { ArrowRight, Utensils, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FFFAF5] text-[#1E1E1E]">
      <Navbar />
      
      <div className="mx-auto max-w-[900px] px-6 py-16 text-center md:py-28">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#FFF5EB] shadow-[0_8px_30px_rgba(224,123,57,0.15)]">
          <Utensils className="h-10 w-10 text-[#E07B39]" />
        </div>
        
        <h1 className="mb-6 text-[40px] font-black tracking-tight text-[#1E1E1E] md:text-[64px] leading-[1.05]">
          Elevating Your <br className="hidden md:block"/> <span className="text-[#DE903E]">Celebration.</span>
        </h1>
        
        <p className="mx-auto mb-14 max-w-[600px] text-[16px] leading-[1.6] font-medium text-[#8B7355] md:text-[19px]">
          Mera Halwai connects you directly with the most premium, verified authentic caterers in Jaipur. 
          No middlemen, pure quality, and a flawless booking experience.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 mb-16 text-left">
          <div className="rounded-[24px] border border-[#E8D5B7] bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <ShieldCheck className="mb-6 h-9 w-9 text-[#804226]" />
            <h3 className="mb-3 text-[20px] font-black tracking-tight text-[#1E1E1E]">100% Verified</h3>
            <p className="text-[14px] leading-relaxed font-medium text-[#8B7355]">Every caterer is physically vetted for extreme quality control and hygiene standards before touching our platform.</p>
          </div>
          <div className="rounded-[24px] border border-[#DE903E]/20 bg-[#FFFBF5] p-8 shadow-[0_8px_30px_rgba(224,123,57,0.08)] transition-all hover:shadow-lg">
            <Star className="mb-6 h-9 w-9 text-[#DE903E] fill-[#DE903E]/20" strokeWidth={2.5} />
            <h3 className="mb-3 text-[20px] font-black tracking-tight text-[#1E1E1E]">Premium Tier</h3>
            <p className="text-[14px] leading-relaxed font-medium text-[#8B7355]">Access exclusive high-demand vendors and legacy halwais continuously rated 5 stars by hundreds of hosts.</p>
          </div>
          <div className="rounded-[24px] border border-[#E8D5B7] bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <Utensils className="mb-6 h-9 w-9 text-[#804226]" />
            <h3 className="mb-3 text-[20px] font-black tracking-tight text-[#1E1E1E]">Zero Middlemen</h3>
            <p className="text-[14px] leading-relaxed font-medium text-[#8B7355]">Direct, uninflated pricing from caterers with complete transparency—scaling perfectly per plate or per package.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
          <Link
            href="/caterers"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#DE903E] px-10 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(224,123,57,0.25)] transition-all hover:scale-[1.02] hover:bg-[#c9692c] active:scale-[0.98] md:w-auto"
          >
            Explore Caterers
            <ArrowRight className="h-4 w-4" strokeWidth={3} />
          </Link>
          <Link
            href="/"
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-white px-10 border border-[#E8D5B7] text-[15px] font-bold text-[#804226] shadow-sm transition-all hover:bg-[#F5F0E6] active:scale-[0.98] md:w-auto"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
