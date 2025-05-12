import { motion } from "framer-motion";
const features = [
  {
    icon: "📊",
    title: "Smart Analytics",
    description: "Real-time spending insights with AI-powered categorization",
  },
  {
    icon: "⏱️",
    title: "Time Saver",
    description: "Automate 90% of your financial tracking in minutes",
  },
  {
    icon: "🔒",
    title: "Bank Security",
    description: "256-bit encryption and read-only bank connections",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text">Powerful Features</h2>
          <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
            Everything you need to transform your financial life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="p-8 rounded-xl bg-background border border-border hover:border-primary transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-text mb-2">{feature.title}</h3>
              <p className="text-text-muted">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
