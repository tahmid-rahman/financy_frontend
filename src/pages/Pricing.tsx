import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Navbar } from "../components/landing";
import { Footer } from "../components/nav";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started with basic financial tracking",
      features: ["Track up to 5 accounts", "Basic budgeting tools", "Monthly reports", "Community support"],
      cta: "Get Started",
      href: "/signup",
      featured: false,
    },
    {
      name: "Pro",
      price: "$9.99",
      description: "For individuals who want advanced financial insights",
      features: [
        "Unlimited accounts",
        "Advanced budgeting",
        "Weekly reports",
        "Bill reminders",
        "Priority support",
        "Custom categories",
      ],
      cta: "Start Free Trial",
      href: "/signup?plan=pro",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For businesses and financial advisors",
      features: [
        "All Pro features",
        "Team management",
        "API access",
        "Dedicated account manager",
        "White-label reports",
        "Advanced analytics",
      ],
      cta: "Contact Sales",
      href: "/contact",
      featured: false,
    },
  ];

  return (
    <div className="bg-surface text-text">
      <Navbar />
      <section className="relative py-20 overflow-hidden">
        {/* Animated gradient background - same as CTA */}
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

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              Join 50,000+ users who transformed their finances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-xl border ${
                  plan.featured ? "border-primary shadow-lg bg-surface" : "border-border bg-surface"
                }`}
              >
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-surface text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-text mb-2">{plan.name}</h3>
                  <p className="text-text-muted mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <span className="text-4xl font-bold text-text">{plan.price}</span>
                    {plan.price !== "Free" && plan.price !== "Custom" && (
                      <span className="text-text-muted">/month</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckIcon className="w-5 h-5 text-primary mr-2" />
                        <span className="text-text">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={plan.href}
                    className={`block w-full text-center px-6 py-3 rounded-lg font-medium ${
                      plan.featured
                        ? "bg-primary text-surface hover:bg-primary-dark"
                        : "bg-surface text-text border border-border hover:border-primary"
                    } transition-all`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-text-muted mb-6">Not sure which plan is right for you?</p>
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-lg bg-surface text-text border border-primary font-medium hover:bg-primary/10 transition-all"
            >
              Contact our team
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
