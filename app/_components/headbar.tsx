"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function HeadBar() {
  const [isVisible, setIsVisible] = useState(true);

  const navLinks = [
    "ADOPT",
    "HELP ANIMALS",
    "HERHEN AMITAN TEJEEH BE",
    "OOLDSON AMITAD",
    "ANKET",
    "ANIMNII EMNELEG",
    "gazriin zurag | map",
  ];

  return (
    <div className="flex flex-col items-center mt-4 px-2">
      {/* Animated Box */}
      <AnimatePresence initial={false}>
        {isVisible && (
          <motion.div
            key="box"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[1000px] h-12 bg-orange-400 rounded-lg mb-4"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex w-full max-w-[1000px] border-4 rounded-3xl border-yellow-200 p-4 gap-4 items-center justify-between">
        {/* Logo */}
        <img className="w-24 h-auto" src="orange.logo.png" alt="Logo" />

        {/* Navbar Links */}
        <div className="flex gap-3 text-sm flex-wrap justify-center">
          {navLinks.map((link) => (
            <motion.div
              key={link}
              whileHover={{ scale: 1.1, y: -2, color: "#0cdcf7" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="cursor-pointer whitespace-nowrap px-2 py-1 rounded hover:bg-yellow-100"
            >
              {link}
            </motion.div>
          ))}
        </div>

        {/* Show/Hide Button */}
        <motion.button
          onClick={() => setIsVisible(!isVisible)}
          whileHover={{ scale: 1.05, backgroundColor: "#0ab2e0" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="px-4 py-2 bg-[#0cdcf7] rounded-lg text-[#0f1115] text-sm"
        >
          {isVisible ? "Hide" : "Show"}
        </motion.button>
      </div>
    </div>
  );
}
