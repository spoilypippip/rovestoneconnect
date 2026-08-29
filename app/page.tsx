import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import FeaturedService from "@/components/FeaturedService";
import HowWeWork from "@/components/HowWeWork";
import SignatureEngagement from "@/components/SignatureEngagement";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import ConsultationSection from "@/components/ConsultationSection";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedService />
      <HowWeWork />
      <SignatureEngagement />
      <Testimonials />
      <About />
      <ConsultationSection />
    </>
  );
}
