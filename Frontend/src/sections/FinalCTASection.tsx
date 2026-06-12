import { useNavigate } from 'react-router';
import ScrollReveal from '@/components/ScrollReveal';
import { finalCtaContent } from '@/features/landing/content';

export default function FinalCTASection() {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-kanda-dark">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 py-[120px]">
        <div className="max-w-[720px] mx-auto text-center">
          <ScrollReveal direction="up" distance={30} duration={0.8}>
            <h2 className="font-display text-[32px] md:text-[40px] lg:text-[48px] leading-[1.12] text-kanda-background">
              {finalCtaContent.headline}
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="up" distance={20} duration={0.7} delay={0.2}>
            <p className="text-lg text-kanda-background/70 leading-relaxed mt-4">
              {finalCtaContent.subtitle}
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" distance={15} duration={0.6} delay={0.4}>
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <button
                type="button"
                onClick={() => navigate('/dashboard-entidades')}
                className="btn-primary"
              >
                {finalCtaContent.cta}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard-administrativo')}
                className="btn-secondary border-kanda-background/30 text-kanda-background hover:border-kanda-primary hover:text-kanda-primary"
              >
                {finalCtaContent.ctaSecondary}
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
