import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  BarChart3,
  Zap,
  Shield,
  Activity,
  Receipt,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-Time Monitoring",
    description:
      "Track your solar panel output live with granular data updates. Know exactly how much energy you're producing at any moment.",
    color: "from-blue-500 to-cyan-400",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Zap,
    title: "AI Anomaly Detection",
    description:
      "Automatically detect performance issues and equipment anomalies using intelligent algorithms before they become costly problems.",
    color: "from-amber-500 to-orange-400",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Deep-dive into production trends, efficiency scores, and energy breakdowns with interactive, beautiful charts and insights.",
    color: "from-green-500 to-emerald-400",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  {
    icon: Receipt,
    title: "Automated Invoicing",
    description:
      "Generate and manage energy invoices effortlessly. Keep track of billing, payments, and revenue in one unified place.",
    color: "from-purple-500 to-violet-400",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Enterprise-grade security with role-based access control. Your solar data stays private and protected at all times.",
    color: "from-rose-500 to-pink-400",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description:
      "Get notified instantly when something needs attention. Custom thresholds and alert policies keep you in control.",
    color: "from-teal-500 to-cyan-400",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
];

function FeatureCard({ feature, index }) {
  const [ref, isVisible] = useScrollReveal(0.15);
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border ${feature.border} ${feature.bg}/50 p-6 lg:p-8 transition-all duration-500 hover:shadow-xl hover:shadow-orange-100/40 hover:-translate-y-1 ${
        isVisible ? "animate-fade-up" : "opacity-0"
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110`}
      >
        <feature.icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600">
        {feature.description}
      </p>

      {/* Decorative corner */}
      <div
        className={`absolute top-0 right-0 w-20 h-20 bg-linear-to-br ${feature.color} opacity-[0.04] rounded-bl-[60px] rounded-tr-2xl transition-opacity duration-300 group-hover:opacity-[0.08]`}
      />
    </div>
  );
}

export default function FeaturesSection() {
  const [titleRef, titleVisible] = useScrollReveal(0.2);

  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Subtle background element */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-orange-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div
          ref={titleRef}
          className={`text-center max-w-2xl mx-auto mb-16 ${
            titleVisible ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100/70 text-orange-700 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Everything You Need to{" "}
            <span className="bg-linear-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              Manage Solar
            </span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            A complete toolkit to monitor, analyze, and optimize your solar energy
            installations from anywhere.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
