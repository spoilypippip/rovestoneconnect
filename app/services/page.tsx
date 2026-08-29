import type { Metadata } from "next";
import ServicesSection from "@/components/ServicesSection";

export const metadata: Metadata = {
  title: "Services | RoveStone Connect",
};

export default function ServicesPage() {
  return <ServicesSection />;
}
