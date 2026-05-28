import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Values from "@/components/Values";
import CTA from "@/components/CTA";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
    
      <About />
      <Values />
      <CTA />
      <Footer />
    </div>
  );
}