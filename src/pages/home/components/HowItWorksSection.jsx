import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  UserPlus,
  ShieldCheck,
  BarChart3,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    description:
      "Sign up in seconds with a secure, seamless onboarding flow. No credit card required to get started.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "Get Approved",
    description:
      "Our admin team reviews your profile and assigns solar units to your account within 24 hours.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Monitor & Analyze",
    description:
      "Access real-time dashboards, energy production data, anomaly alerts, and detailed analytics instantly.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Lightbulb,
    step: "04",
    title: "Optimize & Save",
    description:
      "Use AI-driven insights to maximize efficiency, reduce waste, and lower your energy costs over time.",
    color: "from-purple-500 to-violet-500",
  },
];

export default function HowItWorksSection() {
  const [titleRef, titleVisible] = useScrollReveal(0.2);

  return (
    <section className="relative py-24 lg:py-32 bg-linear-to-b from-amber-50/50 to-white overflow-hidden">
      {/* Divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-orange-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div
          ref={titleRef}
          className={`text-center max-w-2xl mx-auto mb-20 ${
            titleVisible ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100/70 text-orange-700 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Get Started in{" "}
            <span className="bg-linear-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              4 Simple Steps
            </span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            From sign-up to full solar monitoring in minutes — we make it effortless.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-0.5 bg-linear-to-r from-blue-200 via-orange-200 to-purple-200" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <StepCard key={step.step} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }) {
  const [ref, isVisible] = useScrollReveal(0.15);

  return (
    <div
      ref={ref}
      className={`relative flex flex-col items-center text-center ${
        isVisible ? "animate-fade-up" : "opacity-0"
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Step Circle */}
      <div className="relative mb-6">
        <div
          className={`w-14 h-14 rounded-2xl bg-linear-to-br ${step.color} flex items-center justify-center shadow-lg relative z-10 transition-transform duration-300 hover:scale-110`}
        >
          <step.icon className="w-7 h-7 text-white" />
        </div>
        {/* Step Number Badge */}
        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-gray-200 text-xs font-bold text-gray-700 flex items-center justify-center shadow-sm z-20">
          {step.step}
        </span>
        {/* Pulse ring */}
        <div
          className={`absolute inset-0 rounded-2xl bg-linear-to-br ${step.color} opacity-20 animate-ping`}
          style={{ animationDuration: "3s" }}
        />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {step.title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600 max-w-65">
        {step.description}
      </p>

      {/* Arrow connector (mobile / tablet between cards) */}
      {index < 3 && (
        <div className="lg:hidden mt-6 text-orange-300">
          <ArrowRight className="w-5 h-5 rotate-90 mx-auto" />
        </div>
      )}
    </div>
  );
}
