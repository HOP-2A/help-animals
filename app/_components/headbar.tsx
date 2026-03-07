"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/useAuth";

export default function HeadBar() {
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id ?? null;
  const { user } = useAuth(clerkId);
  const userId = user?.id;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const NAV_LINKS = [
    { label: "Амьтдад туслах", href: "/help-animal" },
    { label: "Аврагдсан амьтад", href: "/rescued-animals" },
    {
      label: "Туршлага солилцох булан",
      href: "/experiences",
      emoji: "💬",
    },
    { label: "Амьтан үрчлэх", href: "/adoption" },
    { label: "Эмнэлэгүүд", href: "/veterinary-clinic" },
    { label: "Профайл", href: `/profile/${userId}` },
  ];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isOpen
            ? "bg-[#fffbf4]/96 backdrop-blur-xl shadow-md shadow-amber-900/8 border-b border-amber-100"
            : "bg-[#fffbf4] border-b border-amber-100/60"
        }`}
      >
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-amber-300/50 to-transparent" />

        <div
          className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between gap-6"
          style={{ height: "62px" }}
        >
          <Link href="/" className="shrink-0 flex items-center group">
            <img
              src="/safe-logo.png"
              alt="Logo"
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 rounded-xl text-[13px] font-bold tracking-wide whitespace-nowrap transition-all duration-200 ${
                    active
                      ? "text-[#c2410c]"
                      : "text-[#92400e]/70 hover:text-[#92400e]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-bg"
                      className="absolute inset-0 rounded-xl bg-amber-100/80"
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 rounded-full bg-linear-to-r from-[#f59e0b] to-[#ea580c]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/help-animal"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-[#f59e0b] to-[#ea580c] text-white text-[13px] font-black shadow-md shadow-orange-300/40 hover:scale-105 hover:shadow-orange-400/50 transition-all"
            >
              <span>🐾</span>
              Туслах
            </Link>

            <button
              onClick={() => setIsOpen((v) => !v)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[#92400e]/70 hover:text-[#c2410c] hover:bg-amber-100 transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.div
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-amber-100"
            >
              <div className="px-4 py-4 flex flex-col gap-1 bg-[#fffbf4]">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                          active
                            ? "bg-amber-100 text-[#c2410c] border border-amber-200"
                            : "text-[#92400e]/70 hover:bg-amber-50 hover:text-[#92400e]"
                        }`}
                      >
                        <span className="text-base">{link.emoji}</span>
                        {link.label}
                        {active && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ea580c] shrink-0" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                <div className="mt-3 pt-3 border-t border-amber-100">
                  <Link
                    href="/help-animal"
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-linear-to-r from-[#f59e0b] to-[#ea580c] text-white font-black text-sm shadow-md shadow-orange-300/30"
                  >
                    🐾 Амьтанд туслах
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="h-15.5" />
    </>
  );
}
