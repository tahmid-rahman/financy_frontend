import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 bg-[length:300%_100%]"
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-6">Ready to Transform Your Finances?</h2>
        <p className="text-xl text-text-muted max-w-3xl mx-auto mb-10">
          Join 50,000+ users who saved an average of $200/month
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/signup"
            className="px-8 py-3.5 rounded-lg bg-primary text-surface font-medium shadow-lg hover:bg-primary-dark transition-all"
          >
            Get Started Free
          </Link>
          <Link
            to="/pricing"
            className="px-8 py-3.5 rounded-lg bg-surface text-text border border-border font-medium hover:border-primary transition-all"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
