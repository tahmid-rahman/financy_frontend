import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text">
            <span className="block">Financial Control,</span>
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Effortlessly Yours
            </span>
          </h1>
          <p className="mt-6 text-xl text-text-muted max-w-3xl mx-auto">
            The intuitive way to track spending, save money, and achieve your financial goals.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-3.5 rounded-lg bg-primary text-surface font-medium shadow-lg hover:bg-primary-dark transition-all"
            >
              Start Free Trial
            </Link>
            <Link
              to="/demo"
              className="px-8 py-3.5 rounded-lg border-2 border-border text-text font-medium hover:border-primary transition-all"
            >
              Watch Demo
            </Link>
          </div>
        </motion.div>

        {/* 3D Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-16 rounded-2xl shadow-2xl border border-border overflow-hidden mx-auto max-w-4xl"
        >
          <div className="aspect-video bg-gradient-to-br from-surface to-background flex items-center justify-center">
            <span className="text-text-muted">Dashboard Preview</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
