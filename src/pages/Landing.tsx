import { Navbar, HeroSection, FeaturesGrid, Testimonials, CTA } from "../components/landing";
import { Footer } from "../components/nav";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
