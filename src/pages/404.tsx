import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Navbar } from "../components/landing";
import { Footer } from "../components/nav";

const NotFound = () => {
  const location = useLocation();
  const [gifLoaded, setGifLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fallbackActive, setFallbackActive] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // GIF sources with fallbacks
  const gifSources = [
    "https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif",
    "/assets/404-animation.gif",
    "/assets/404-animation.webp",
  ];

  const currentGifSource = fallbackActive ? gifSources[1] : gifSources[0];

  return (
    <>
      <Navbar />

      <section
        className="relative min-h-screen flex items-center justify-center bg-surface overflow-hidden mt-[-64px]"
        aria-labelledby="not-found-title"
      >
        {/* Animated gradient background with reduced motion support */}
        <motion.div
          animate={
            reducedMotion
              ? {}
              : {
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }
          }
          transition={
            reducedMotion
              ? {}
              : {
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                }
          }
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 bg-[length:300%_100%]"
        />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 w-full py-12">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
            {/* GIF container - always visible */}
            <motion.div
              className="w-full lg:w-1/2 max-w-xl"
              initial={reducedMotion ? {} : { opacity: 0, x: -50 }}
              animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
              transition={reducedMotion ? {} : { duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative aspect-square w-full">
                {/* Always show the GIF container */}
                <div className="absolute inset-0">
                  {!gifLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface/50">
                      <div className="w-24 h-24 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  )}

                  <img
                    src={currentGifSource}
                    alt="404 animation showing someone lost"
                    className={`w-full h-full object-contain ${gifLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setGifLoaded(true)}
                    onError={() => {
                      if (!fallbackActive) {
                        setFallbackActive(true);
                        setGifLoaded(false); // Retry with fallback
                      }
                    }}
                    loading="eager" // Changed from lazy to eager
                    decoding="async"
                  />
                </div>
              </div>
            </motion.div>

            {/* Content area */}
            <motion.div
              className="w-full lg:w-1/2 text-center lg:text-left"
              initial={reducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={reducedMotion ? {} : { delay: 0.5, duration: 0.6 }}
            >
              <h1 id="not-found-title" className="text-6xl md:text-8xl font-bold text-primary mb-4">
                404
              </h1>

              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">Page Not Found</h2>

              <p className="text-xl text-text-muted mb-6 max-w-md mx-auto lg:mx-0">
                We couldn't find{" "}
                <code className="bg-surface-dark px-2 py-1 rounded text-sm break-all">{location.pathname}</code>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link
                  to="/"
                  className="px-8 py-3.5 rounded-lg bg-primary text-surface font-medium shadow-lg hover:bg-primary-dark transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Return to home page"
                >
                  Return Home
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-3.5 rounded-lg bg-surface text-text border border-border font-medium hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Contact support"
                >
                  Contact Support
                </Link>
              </div>

              {/* Helpful suggestions */}
              <div className="text-sm text-text-muted">
                <p className="mb-2">You might be looking for:</p>
                <ul className="flex flex-wrap justify-center lg:justify-start gap-2">
                  {["/", "/features", "/blog", "/help"].map((path) => (
                    <li key={path}>
                      <Link
                        to={path}
                        className="hover:text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {path === "/" ? "Home" : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Status indicator */}
              <div className="mt-6 text-xs text-text-muted opacity-70">
                {!gifLoaded ? (
                  <p>Loading animation...</p>
                ) : (
                  <p>Loaded: {fallbackActive ? "Local fallback" : "Primary animation"}</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default NotFound;
