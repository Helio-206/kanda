import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router';
import { heroContent } from '@/features/landing/content';
import GeoIntelligencePanel from '@/components/GeoIntelligencePanel';

interface HeroSectionProps {
  onScrollTo: (target: string) => void;
}

export default function HeroSection({ onScrollTo }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const overlineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    // Decorative line
    tl.fromTo(
      lineRef.current,
      { scaleX: 0, transformOrigin: 'left' },
      { scaleX: 1, duration: 0.6, ease: 'power3.out' },
      0
    );

    // Overline
    tl.fromTo(
      overlineRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      0.2
    );

    // Headline words stagger
    const headline = headlineRef.current;
    if (headline) {
      const words = headline.querySelectorAll('.hero-word');
      tl.fromTo(
        words,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' },
        0.3
      );
    }

    // Subtitle
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.3'
    );

    // Buttons
    tl.fromTo(
      buttonsRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      '-=0.2'
    );

    // Image
    tl.fromTo(
      imageRef.current,
      { opacity: 0, scale: 1.06 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' },
      '-=0.3'
    );

    return () => { tl.kill(); };
  }, []);

  const words = heroContent.headline.split(' ');

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full min-h-[90vh] overflow-hidden pt-[150px] pb-[110px] px-5 md:px-10 lg:px-20"
    >
      <div className="absolute inset-0 pointer-events-none opacity-55 [background-image:linear-gradient(rgba(7,21,18,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(7,21,18,0.05)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="relative z-10 max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left Column - Text */}
        <div className="flex-[1.2] max-w-[560px] flex flex-col items-start">
          {/* Decorative Line */}
          <div
            ref={lineRef}
            className="w-20 h-px bg-kanda-primary mb-5"
            style={{ transformOrigin: 'left' }}
          />

          {/* Overline */}
          <span
            ref={overlineRef}
            className="overline-label text-kanda-text-secondary mb-3 opacity-0"
          >
            {heroContent.overline}
          </span>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="font-display text-[40px] md:text-[56px] lg:text-[72px] leading-[1.08] text-kanda-text-primary"
          >
            {words.map((word, i) => (
              <span key={i} className="hero-word inline-block mr-[0.3em] opacity-0">
                {word}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <div
            ref={subtitleRef}
            className="text-lg text-kanda-text-secondary leading-relaxed max-w-[520px] mt-6 opacity-0 space-y-4"
          >
            {heroContent.subtitle.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {/* Buttons */}
          <div ref={buttonsRef} className="flex flex-wrap gap-4 mt-8 opacity-0">
            <button
              type="button"
              onClick={() => onScrollTo('como-funciona')}
              className="btn-primary"
            >
              {heroContent.ctaPrimary}
            </button>
            <Link to="/dashboard-entidades" className="btn-secondary no-underline">
              {heroContent.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Right Column - Geospatial product view */}
        <div
          ref={imageRef}
          className="flex-1 max-w-[620px] w-full opacity-0"
        >
          <GeoIntelligencePanel />
        </div>
      </div>
    </section>
  );
}
