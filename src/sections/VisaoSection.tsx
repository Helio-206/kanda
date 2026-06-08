import ScrollReveal from '@/components/ScrollReveal';
import { visaoContent } from '@/features/landing/content';

export default function VisaoSection() {
  return (
    <section id="visao" className="w-full border-t border-kanda-divider">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 py-[120px]">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
          <ScrollReveal
            className="flex-[1.2] max-w-[560px] w-full"
            direction="up"
            scale={1.03}
            duration={1.0}
          >
            <img
              src="/images/visao-luanda.jpg"
              alt="Zona organizada de Luanda, Angola"
              className="w-full h-auto rounded-sm object-cover"
              style={{ boxShadow: '0 4px 20px rgba(12, 21, 26, 0.08)' }}
            />
          </ScrollReveal>

          <ScrollReveal
            className="flex-1 max-w-[480px]"
            direction="up"
            delay={0.2}
          >
            <span className="overline-label text-kanda-primary block mb-4">
              {visaoContent.overline}
            </span>
            <h2 className="font-display text-[32px] md:text-[40px] lg:text-[48px] leading-[1.12] text-kanda-text-primary mb-6">
              {visaoContent.title}
            </h2>
            <div className="text-kanda-text-secondary leading-relaxed space-y-4">
              {visaoContent.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
