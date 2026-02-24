import { SolarPulseLogoLink } from "@/components/Logo";
import { Sun } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: ["Dashboard", "Analytics", "Anomaly Detection", "Invoicing"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-gray-950 text-gray-400 overflow-hidden">
      {/* Top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-orange-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                SolarPulse
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Smart solar monitoring platform that helps you track production,
              detect issues, and optimize your energy investment.
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="text-sm hover:text-orange-400 transition-colors cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SolarPulse. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>Built with</span>
            <Sun className="w-3.5 h-3.5 text-orange-500 mx-0.5" />
            <span>for a sustainable future</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
