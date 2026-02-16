"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";

export default function HeadBar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    "АМЬТДАД ТУСЛАХ",
    "ОЛДСОН АМЬТАД",
    "ТУРШЛАГА СОЛИЛЦОХ БУЛАН",
    "ҮРЧЛЭХ",
    "АМЬТНЫ ЭМНЭЛЭГҮҮД",
    "ПРОФАЙЛ",
  ];

  return (
    <header className="w-full bg-white shadow-sm border-b">
      <div className="max-w-1000 mx-auto lg:px-17 sm:px-3 py-2 flex items-center justify-between">
        <img src="/safe-logo.png" alt="Logo" className="w-33 object-contain" />

        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wide">
          {navLinks.map((link) => (
            <div
              key={link}
              className="cursor-pointer hover:text-orange-500 transition text-base font-bold"
            >
              {link}
            </div>
          ))}

          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search..."
              className="w-full border border-gray-300 rounded-md pr-10 pl-3 py-1 text-sm outline-none"
            />
            <button className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 hover:bg-orange-100 rounded">
              <Search size={18} className="text-orange-500" />
            </button>
          </div>
        </nav>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-2xl"
        >
          ☰
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t px-6 py-4 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <div
                key={link}
                className="cursor-pointer hover:text-orange-500 transition text-base font-bold"
              >
                {link}
              </div>
            ))}

            <div className="flex items-center border border-gray-300 rounded-md px-3 py-1">
              <input
                placeholder="Search..."
                className="text-sm outline-none flex-1"
              />
              <Search size={18} className="ml-2 text-orange-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
