import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/sections/HeroSection';
import ProblemaSection from '@/sections/ProblemaSection';
import SolucaoSection from '@/sections/SolucaoSection';
import AutomatedAnalysisSection from '@/sections/AutomatedAnalysisSection';
import ComoFuncionaSection from '@/sections/ComoFuncionaSection';
import BeneficiosSection from '@/sections/BeneficiosSection';
import VisaoSection from '@/sections/VisaoSection';
import FinalCTASection from '@/sections/FinalCTASection';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  const handleScrollTo = useCallback((target: string) => {
    const el = document.getElementById(target);
    if (!el) {
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -72 });
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.requestAnimationFrame(() => {
      window.scrollBy({ top: -72, behavior: 'auto' });
    });
  }, []);

  return (
    <div className="min-h-screen bg-kanda-background">
      <Navigation onScrollTo={handleScrollTo} />

      <main>
        <HeroSection onScrollTo={handleScrollTo} />
        <ProblemaSection />
        <SolucaoSection />
        <AutomatedAnalysisSection />
        <ComoFuncionaSection />
        <BeneficiosSection />
        <VisaoSection />
        <FinalCTASection />
      </main>

      <Footer onScrollTo={handleScrollTo} />
    </div>
  );
}
