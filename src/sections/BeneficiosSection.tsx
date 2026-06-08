import ScrollReveal from '@/components/ScrollReveal';
import BeneficioCard from '@/components/BeneficioCard';
import { beneficiosContent } from '@/features/landing/content';

export default function BeneficiosSection() {
  return (
    <section id="beneficios" className="w-full border-t border-kanda-divider">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 py-[120px]">
        <ScrollReveal className="text-center mb-16">
          <span className="overline-label text-kanda-primary block mb-4">
            {beneficiosContent.overline}
          </span>
          <h2 className="font-display text-[32px] md:text-[40px] lg:text-[48px] leading-[1.12] text-kanda-text-primary">
            {beneficiosContent.title}
          </h2>
        </ScrollReveal>

        <ScrollReveal
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          stagger={0.1}
          distance={40}
          duration={0.7}
          childSelector=".beneficio-card-wrapper"
        >
          {beneficiosContent.groups.map((group) => (
            <div key={group.title} className="beneficio-card-wrapper">
              <BeneficioCard title={group.title} items={[...group.items]} />
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
