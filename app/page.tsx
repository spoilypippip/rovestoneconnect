import Hero from "@/components/Hero";
import WhatWeHelpSection from "@/components/WhatWeHelpSection";
import WhoWeHelpSection from "@/components/WhoWeHelpSection";
import FeaturedService from "@/components/FeaturedService";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyConnectSection from "@/components/WhyConnectSection";
import HowWeWork from "@/components/HowWeWork";
import SignatureEngagement from "@/components/SignatureEngagement";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import ConsultationSection from "@/components/ConsultationSection";

export default function Home() {
  return (
    <>
      <Hero />
      <WhatWeHelpSection />
      <WhoWeHelpSection />
      <FeaturedService />
      <HowItWorksSection />
      <WhyConnectSection />
      <HowWeWork />
      <SignatureEngagement />
      <Testimonials />
      <About />
      <ConsultationSection />
    </>
  );
}
