import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Solar Farm Manager",
    quote:
      "SolarPulse has completely changed how we manage our installations. The anomaly detection saved us from a major equipment failure last month.",
    rating: 5,
    avatar: "SC",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "James Okafor",
    role: "Residential Owner",
    quote:
      "The real-time dashboard is incredible. I can see exactly how much energy my panels are producing and how much money I'm saving every day.",
    rating: 5,
    avatar: "JO",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    name: "Maria Rodriguez",
    role: "Energy Consultant",
    quote:
      "I recommend SolarPulse to all my clients. The analytics and reporting make it so easy to optimize performance across multiple sites.",
    rating: 5,
    avatar: "MR",
    gradient: "from-green-500 to-emerald-500",
  },
];

export default function TestimonialsSection() {
  const [titleRef, titleVisible] = useScrollReveal(0.2);

  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-orange-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div
          ref={titleRef}
          className={`text-center max-w-2xl mx-auto mb-16 ${
            titleVisible ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100/70 text-orange-700 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Loved by{" "}
            <span className="bg-linear-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              Solar Teams
            </span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            See what our users have to say about their experience with SolarPulse.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial, index }) {
  const [ref, isVisible] = useScrollReveal(0.15);

  return (
    <div
      ref={ref}
      className={`relative p-8 rounded-2xl border border-gray-100 bg-gray-50/50 hover:shadow-lg hover:shadow-orange-100/30 hover:-translate-y-1 transition-all duration-500 ${
        isVisible ? "animate-fade-up" : "opacity-0"
      }`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Quote icon */}
      <Quote className="w-8 h-8 text-orange-200 mb-4" />

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-amber-400 text-amber-400"
          />
        ))}
      </div>

      {/* Quote text */}
      <p className="text-gray-700 leading-relaxed mb-6 text-sm">
        "{testimonial.quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div
          className={`w-10 h-10 rounded-full bg-linear-to-br ${testimonial.gradient} flex items-center justify-center text-white text-sm font-semibold`}
        >
          {testimonial.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
          <p className="text-xs text-gray-500">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
