"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import LogoOrange from "@/logos/Horizontal/MH_Logo_Horizontal_Orange.png";

const footerLinks = {
  discover: [
    { label: "Find Caterers", href: "/caterers" },
    { label: "Wedding Catering", href: "/caterers?event=Wedding" },
    { label: "Corporate Events", href: "/caterers?event=Corporate" },
    { label: "Birthday Parties", href: "/caterers?event=Birthday" },
    { label: "Satsang & Pooja", href: "/caterers?event=Pooja" },
  ],
  cuisines: [
    { label: "Rajasthani", href: "/caterers?cuisine=Rajasthani" },
    { label: "North Indian", href: "/caterers?cuisine=North+Indian" },
    { label: "Mughlai", href: "/caterers?cuisine=Mughlai" },
    { label: "South Indian", href: "/caterers?cuisine=South+Indian" },
    { label: "Chaat & Snacks", href: "/caterers?cuisine=Chaat" },
  ],
  company: [
    { label: "About Us", href: "/" },
    { label: "How It Works", href: "/" },
    { label: "Trust & Safety", href: "/" },
    { label: "Help Center", href: "/" },
    { label: "Privacy Policy", href: "/" },
  ],
};

type SectionKey = keyof typeof footerLinks;
const sectionLabels: Record<SectionKey, string> = {
  discover: "Discover",
  cuisines: "Cuisines",
  company: "Company",
};

export default function Footer() {
  const [mobileOpen, setMobileOpen] = useState<Record<SectionKey, boolean>>({
    discover: false,
    cuisines: false,
    company: false,
  });

  const toggleSection = (key: SectionKey) =>
    setMobileOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <footer className="border-t border-[#E8D5B7] bg-[#FFFAF5]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <div className="md:hidden">
          <div className="rounded-[24px] border border-[#E8D5B7] bg-white/80 px-5 py-5 shadow-[0_18px_38px_rgba(95,61,28,0.08)]">
            <Image src={LogoOrange} alt="Mera Halwai" className="h-[34px] w-auto object-contain" />
            <p className="mt-3 max-w-[280px] text-[13px] leading-relaxed text-[#8B7355]">
              Jaipur&apos;s catering marketplace for verified vendors, clear package pricing, and easier booking decisions.
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-[12px] text-[#8B7355]">
                <Phone className="h-3.5 w-3.5 flex-shrink-0 text-[#DE903E]" />
                +91 123 456 7890
              </div>
              <div className="flex items-center gap-2.5 text-[12px] text-[#8B7355]">
                <Mail className="h-3.5 w-3.5 flex-shrink-0 text-[#DE903E]" />
                hello@merahalwai.com
              </div>
              <div className="flex items-center gap-2.5 text-[12px] text-[#8B7355]">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#DE903E]" />
                Jaipur, Rajasthan
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, index) => (
                <button
                  key={index}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8D5B7] bg-white text-[#8B7355] transition-all hover:border-[#DE903E] hover:text-[#DE903E]"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 divide-y divide-[#E8D5B7] rounded-[24px] border border-[#E8D5B7] bg-white/70 px-4">
            {(Object.keys(footerLinks) as SectionKey[]).map((key) => (
              <div key={key}>
                <button
                  onClick={() => toggleSection(key)}
                  className="flex w-full items-center justify-between py-4 text-left"
                >
                  <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#804226]">
                    {sectionLabels[key]}
                  </span>
                  <ChevronDown
                    className={
                      "h-4 w-4 text-[#8B7355] transition-transform " +
                      (mobileOpen[key] ? "rotate-180" : "rotate-0")
                    }
                  />
                </button>
                {mobileOpen[key] ? (
                  <div className="flex flex-col gap-3 pb-4">
                    {footerLinks[key].map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="text-[13px] text-[#8B7355] transition-colors hover:text-[#804226]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden gap-10 md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Image src={LogoOrange} alt="Mera Halwai" className="h-[36px] w-auto object-contain" />
            <p className="mt-4 max-w-[260px] text-[13px] leading-relaxed text-[#8B7355]">
              Jaipur&apos;s most trusted platform to book verified halwais and caterers with transparent pricing.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-[12px] text-[#8B7355]">
                <Phone className="h-3.5 w-3.5 flex-shrink-0 text-[#DE903E]" />
                +91 123 456 7890
              </div>
              <div className="flex items-center gap-2.5 text-[12px] text-[#8B7355]">
                <Mail className="h-3.5 w-3.5 flex-shrink-0 text-[#DE903E]" />
                hello@merahalwai.com
              </div>
              <div className="flex items-center gap-2.5 text-[12px] text-[#8B7355]">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#DE903E]" />
                Jaipur, Rajasthan
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, index) => (
                <button
                  key={index}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8D5B7] bg-white text-[#8B7355] transition-all hover:border-[#DE903E] hover:text-[#DE903E]"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[12px] font-bold uppercase tracking-widest text-[#804226]">Discover</p>
            <div className="flex flex-col gap-2.5">
              {footerLinks.discover.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13px] text-[#8B7355] transition-colors hover:text-[#804226]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[12px] font-bold uppercase tracking-widest text-[#804226]">Cuisines</p>
            <div className="flex flex-col gap-2.5">
              {footerLinks.cuisines.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13px] text-[#8B7355] transition-colors hover:text-[#804226]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[12px] font-bold uppercase tracking-widest text-[#804226]">Company</p>
            <div className="flex flex-col gap-2.5">
              {footerLinks.company.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13px] text-[#8B7355] transition-colors hover:text-[#804226]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E8D5B7]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-[12px] text-[#8B7355] md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} Mera Halwai. All rights reserved. Made with love for Jaipur&apos;s Halwais.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#804226]">Terms</Link>
            <Link href="/" className="hover:text-[#804226]">Privacy</Link>
            <Link href="/" className="hover:text-[#804226]">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
