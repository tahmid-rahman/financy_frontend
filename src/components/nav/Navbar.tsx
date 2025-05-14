"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  CalendarIcon,
  WalletIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <ChartBarIcon className="w-5 h-5" /> },
    { name: "Expenses", path: "/expenses", icon: <WalletIcon className="w-5 h-5" /> },
    { name: "Income", path: "/income", icon: <WalletIcon className="w-5 h-5" /> },
    { name: "Schedule", path: "/schedule", icon: <CalendarIcon className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <header
        className={`fixed w-full z-50 transition-all shadow-md duration-300 ${
          scrolled
            ? "bg-surface/80 backdrop-blur-md border-b border-border/10 shadow-sm"
            : "bg-surface/70 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
              <span className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Financy
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    location.pathname === link.path ? "text-primary font-medium" : "text-text-muted hover:text-primary"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Side Controls */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {user?.name?.charAt(0) || <UserCircleIcon className="w-5 h-5" />}
                  </div>
                  <span className="text-sm font-medium hidden lg:inline-block">{user?.name || "Account"}</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 origin-top-right bg-surface rounded-md shadow-lg border border-border/50 z-50 animate-in fade-in slide-in-from-top-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-text-muted border-b border-border/50">
                        {/* Signed in as <span className="font-medium text-text">{user?.email}</span> */}
                        Signed in as <span className="font-medium text-text">{user?.name}</span>
                      </div>
                      <Link
                        to="/profile"
                        className="flex px-4 py-2 text-sm text-text hover:bg-background/80 transition-colors items-center gap-2"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserIcon className="w-4 h-4" />
                        Your Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex px-4 py-2 text-sm text-text hover:bg-background/80 transition-colors items-center gap-2"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-text hover:bg-background/80 transition-colors flex items-center gap-2"
                      >
                        <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-text-muted hover:text-text focus:outline-none transition-colors hover:bg-background/50"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-surface shadow-lg animate-in slide-in-from-top-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? "bg-background text-primary"
                      : "text-text-muted hover:bg-background hover:text-text"
                  } transition-colors`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-border/70">
              <div className="flex items-center px-5 pb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {user?.name?.charAt(0) || <UserCircleIcon className="w-6 h-6" />}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-text">{user?.name || "Account"}</div>
                  {/* <div className="text-xs text-text-muted">{user?.email}</div> */}
                </div>
              </div>
              <div className="mt-1 px-2 space-y-1">
                <Link
                  to="/profile"
                  className="flex px-3 py-3 text-base text-text hover:bg-background/80 transition-colors items-center gap-3 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <UserIcon className="w-5 h-5" />
                  Your Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex px-3 py-3 text-base text-text hover:bg-background/80 transition-colors items-center gap-3 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  Settings
                </Link>
                <div className="px-3 py-3 flex items-center justify-between rounded-md hover:bg-background/80">
                  <span className="text-base text-text flex items-center gap-3">
                    <Cog6ToothIcon className="w-5 h-5" />
                    Theme
                  </span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 rounded-md text-base text-text hover:bg-background/80 transition-colors flex items-center gap-3"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
