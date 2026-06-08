import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  IconFotografia,
  IconProcessing,
  IconLocalizacao,
  IconEncaminhamento,
  IconResolucao,
} from '@/components/Icons';

gsap.registerPlugin(ScrollTrigger);

const processSteps = [
  { icon: <IconFotografia size={24} />, label: 'Fotografia' },
  { icon: <IconProcessing size={24} />, label: 'Análise' },
  { icon: <IconLocalizacao size={24} />, label: 'Localização' },
  { icon: <IconResolucao size={24} />, label: 'Prioridade' },
  { icon: <IconEncaminhamento size={24} />, label: 'Acompanhamento' },
];

export default function ComoFuncionaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const line = lineRef.current;
    const nodes = nodesRef.current.filter(Boolean);
    if (!section || !header || !line || nodes.length === 0) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Header fade in
    tl.from(header.children, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
    });

    // Line draws from left
    tl.fromTo(
      line,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 1.2, ease: 'power3.out' },
      '-=0.4'
    );

    // Nodes stagger in
    tl.from(
      nodes,
      {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.7)',
      },
      '-=0.8'
    );

    return () => { tl.kill(); };
  }, []);

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="w-full bg-kanda-dark"
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 py-[120px]">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-20">
          <span className="overline-label text-kanda-background/60 block mb-4">
            COMO FUNCIONA
          </span>
          <h2 className="font-display text-[32px] md:text-[40px] lg:text-[48px] leading-[1.12] text-kanda-background">
            Do registo à ocorrência qualificada em cinco passos.
          </h2>
        </div>

        {/* Process Flow */}
        <div className="process-flow-container relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-kanda-background/20">
            <div
              ref={lineRef}
              className="h-full bg-kanda-primary/40"
              style={{ transformOrigin: 'left center' }}
            />
          </div>

          {/* Nodes */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-0">
            {processSteps.map((step, i) => (
              <div
                key={step.label}
                ref={(el) => { nodesRef.current[i] = el; }}
                className="flex flex-col items-center relative z-10 lg:flex-1"
              >
                <div className="group w-16 h-16 rounded-full border border-kanda-background/30 flex items-center justify-center transition-colors duration-300 hover:border-kanda-primary bg-kanda-dark">
                  <div className="text-kanda-background/90 group-hover:text-kanda-primary transition-colors duration-300">
                    {step.icon}
                  </div>
                </div>
                <span className="mt-4 text-[13px] text-kanda-background/70 whitespace-nowrap">
                  {step.label}
                </span>

                {/* Mobile vertical connector */}
                {i < processSteps.length - 1 && (
                  <div className="lg:hidden w-px h-12 bg-kanda-background/20 mt-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
