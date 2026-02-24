import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import StatsSection from "./components/StatsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

const HomePage = () => {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default HomePage;
