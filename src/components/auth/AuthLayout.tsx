// components/auth/AuthLayout.tsx
import { motion } from "framer-motion";
import { useRef } from "react";
import { Navbar } from "../landing";

// Inline SVG noise texture (no external file needed)
const NoiseTexture = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-5">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const constraintsRef = useRef(null);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center p-4 overflow-hidden" ref={constraintsRef}>
        <NoiseTexture />

        {/* 3D Floating Elements */}
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          animate={{
            x: [0, 15, 0],
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 left-1/4 w-40 h-40 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-md border border-primary/20 shadow-lg"
        />

        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.2}
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-tr from-accent/10 to-accent/5 backdrop-blur-md border border-accent/20 shadow-lg"
        />

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-sm border border-border dark:border-border-dark rounded-3xl shadow-2xl overflow-hidden"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};
