import { Link } from "react-router";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight, Sun, Sparkles } from "lucide-react";

export default function CTASection() {
  const [ref, isVisible] = useScrollReveal(0.2);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-orange-600 via-amber-500 to-yellow-500" />

      {/* Animated patterns */}
      <div className="absolute top-10 left-[5%] w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float-slow" />
      <div className="absolute bottom-10 right-[10%] w-56 h-56 bg-white/10 rounded-full blur-3xl animate-float delay-300" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      <div
        ref={ref}
        className={`relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center ${
          isVisible ? "animate-scale-in" : "opacity-0"
        }`}
      >
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-8">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
          Ready to Take Control of Your
          <br />
          Solar Energy?
        </h2>
        <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join SolarPulse today and start monitoring your solar installations
          with real-time data, AI-powered insights, and intelligent alerts.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <SignedOut>
            <Button
              asChild
              size="lg"
              className="h-14 px-10 text-base rounded-xl bg-white text-orange-600 hover:bg-white/90 shadow-lg shadow-orange-700/20 transition-all duration-300 hover:-translate-y-0.5 font-semibold"
            >
              <Link to="/sign-up">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-10 text-base rounded-xl border-2 border-white/40 text-white bg-transparent hover:bg-white/10 hover:border-white/60 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button
              asChild
              size="lg"
              className="h-14 px-10 text-base rounded-xl bg-white text-orange-600 hover:bg-white/90 shadow-lg shadow-orange-700/20 transition-all duration-300 hover:-translate-y-0.5 font-semibold"
            >
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </SignedIn>
        </div>

        {/* Trust line */}
        <p className="mt-8 text-sm text-white/60 flex items-center justify-center gap-2">
          <Sun className="w-4 h-4" />
          No credit card required &middot; Free tier available
        </p>
      </div>
    </section>
  );
}
