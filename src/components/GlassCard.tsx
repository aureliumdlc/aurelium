"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  hover = true,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      className={`liquid-glass ${className}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -6, scale: 1.01 } : undefined}
    >
      <div className="liquid-glass-edge" aria-hidden />
      <motion.div
        className="liquid-glass-shine"
        aria-hidden
        animate={{ x: ["-120%", "220%"] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />
      <div className="liquid-glass-blob" aria-hidden />
      <motion.div className="liquid-glass-inner">{children}</motion.div>
    </motion.div>
  );
}
