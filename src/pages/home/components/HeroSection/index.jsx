import { Link } from "react-router";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Zap,
  ArrowRight,
  BarChart3,
  Shield,
  Activity,
} from "lucide-react";
import imgWindTurbine from "./wind-turbine.png";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-50 via-orange-50/40 to-white" />

      {/* Floating Orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-float delay-300" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-yellow-100/20 rounded-full blur-3xl" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/80 border border-orange-200/60 text-sm font-medium text-orange-700 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
                Smart Solar Monitoring Platform
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="animate-fade-up delay-100 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                Monitor Your
                <span className="block mt-2 bg-linear-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent animate-shine bg-size-[200%_auto]">
                  Solar Energy
                </span>
                <span className="block mt-2">in Real-Time</span>
              </h1>
              <p className="animate-fade-up delay-200 text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
                Track production, detect anomalies instantly, and optimize your solar
                investment with intelligent analytics and alerts.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="animate-fade-up delay-300 flex flex-wrap items-center gap-4">
              <SignedOut>
                <Button
                  asChild
                  size="lg"
                  className="h-13 px-8 text-base rounded-xl shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 transition-all duration-300 hover:-translate-y-0.5"
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
                  className="h-13 px-8 text-base rounded-xl border-2 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Link to="/sign-in">Sign In</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button
                  asChild
                  size="lg"
                  className="h-13 px-8 text-base rounded-xl shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </SignedIn>
            </div>

            {/* Trust Indicators */}
            <div className="animate-fade-up delay-400 flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Real-Time Alerts</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>AI Anomaly Detection</span>
              </div>
            </div>
          </div>

          {/* Right — Visual */}
          <div className="relative animate-scale-in delay-300 hidden md:block">
            {/* Main Card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-orange-100/60 shadow-2xl shadow-orange-100/40 p-6 lg:p-8">
              {/* Dashboard Preview */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-pulse-glow">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">SolarPulse Dashboard</p>
                  <p className="text-xs text-gray-500">Live monitoring active</p>
                </div>
                <span className="ml-auto px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  Online
                </span>
              </div>

              {/* Mini Chart Visualization */}
              <div className="bg-linear-to-br from-amber-50/80 to-orange-50/60 rounded-2xl p-5 mb-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Energy Production</span>
                  <span className="text-sm font-bold text-orange-600">24.8 kWh</span>
                </div>
                {/* Animated Bars */}
                <div className="flex items-end gap-2 h-28">
                  {[65, 80, 45, 90, 72, 85, 95, 60, 78, 88, 70, 92].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md bg-linear-to-t from-orange-500 to-amber-400 opacity-0 animate-fade-up"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${600 + i * 80}ms`,
                        animationFillMode: "forwards",
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                  <span>6 AM</span>
                  <span>12 PM</span>
                  <span>6 PM</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Capacity", value: "94%", icon: Zap, color: "text-amber-600 bg-amber-50" },
                  { label: "Saved", value: "$127", icon: BarChart3, color: "text-green-600 bg-green-50" },
                  { label: "Alerts", value: "0", icon: Shield, color: "text-blue-600 bg-blue-50" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="text-center p-3 rounded-xl bg-white border border-gray-100 shadow-sm animate-fade-up"
                    style={{ animationDelay: `${900 + i * 100}ms` }}
                  >
                    <stat.icon className={`w-5 h-5 mx-auto mb-1.5 p-1 rounded-md ${stat.color}`} />
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[10px] text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Accent Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-linear-to-br from-yellow-300 to-amber-400 rounded-2xl rotate-12 opacity-20 animate-float" />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-linear-to-br from-orange-400 to-red-400 rounded-2xl -rotate-12 opacity-15 animate-float-slow delay-200" />

            {/* Solar panel thumbnail */}
            <div className="absolute -bottom-3 right-8 animate-float delay-500">
              <img
                src={imgWindTurbine}
                alt="Solar panels"
                className="w-24 h-14 object-cover rounded-xl shadow-lg border-2 border-white"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
