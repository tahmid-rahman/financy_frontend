import { Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-surface/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            {/* <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">*/}
            <span className="text-2xl font-bold bg-primary bg-clip-text text-transparent">Financy</span>
          </Link>
          <div className="flex gap-1 md:gap-4">
            <ThemeToggle />
            <Link to="/login" className="px-4 py-2 text-text hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-md bg-primary text-surface hover:bg-primary-dark transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
