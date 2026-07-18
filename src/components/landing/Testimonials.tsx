import { motion } from "framer-motion";
const testimonials = [
  {
    quote: "Saved me over $3,000 in the first 3 months by revealing hidden spending patterns.",
    author: "Abdur Rahman.",
    role: "Freelance Developer",
  },
  {
    quote: "Finally a finance app that doesn't make me feel guilty about my coffee habit.",
    author: "Tahmid Rahman.",
    role: "Data Scientist",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`flex-1 p-8 rounded-2xl bg-surface border border-border ${index % 2 === 0 ? "" : ""}`}
            >
              <blockquote className="text-lg italic text-text mb-6">"{testimonial.quote}"</blockquote>
              <div>
                <p className="font-medium text-text">{testimonial.author}</p>
                <p className="text-text-muted text-sm">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
