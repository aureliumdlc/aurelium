"use client";

import { motion } from "framer-motion";

export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-[20%] top-[-10%] h-[55vh] w-[55vh] rounded-full bg-violet-900/30 blur-[100px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[15%] top-[20%] h-[45vh] w-[45vh] rounded-full bg-purple-800/20 blur-[90px]"
        animate={{ x: [0, -35, 0], y: [0, 25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[-5%] left-[30%] h-[40vh] w-[50vh] rounded-full bg-indigo-900/25 blur-[110px]"
        animate={{ x: [0, 25, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
