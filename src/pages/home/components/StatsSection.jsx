import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useRef, useState, useEffect } from "react";

const stats = [
  {
    value: 50000,
    suffix: "+",
    label: "kWh Tracked",
    description: "Energy monitored across all installations",
  },
  {
    value: 99.9,
    suffix: "%",
    label: "Uptime",
    description: "Platform reliability you can count on",
  },
  {
    value: 500,
    suffix: "+",
    label: "Anomalies Caught",
    description: "Issues detected before becoming problems",
  },
  {
    value: 24,
    suffix: "/7",
    label: "Monitoring",
    description: "Round the clock energy tracking",
  },
];

function AnimatedCounter({ value, suffix, shouldAnimate }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [shouldAnimate, value]);

  const display = Number.isInteger(value)
    ? Math.floor(count).toLocaleString()
    : count.toFixed(1);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const [ref, isVisible] = useScrollReveal(0.25);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-900 to-gray-800" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-16 ${
            isVisible ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium mb-4 border border-orange-500/20">
            By the Numbers
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Trusted by Solar Professionals
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Real impact, measured in energy saved and problems prevented.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`relative text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/10 hover:border-orange-500/30 hover:-translate-y-1 ${
                isVisible ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${200 + i * 120}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent mb-2">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  shouldAnimate={isVisible}
                />
              </div>
              <div className="text-lg font-semibold text-white mb-1">
                {stat.label}
              </div>
              <p className="text-sm text-gray-500">{stat.description}</p>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-br from-orange-500/10 to-transparent rounded-bl-[40px] rounded-tr-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
