import ScrollReveal from '@/components/ScrollReveal';
import StepCard from '@/components/StepCard';
import {
  IconFotografia,
  IconAnalise,
  IconLocalizacao,
  IconEncaminhamento,
} from '@/components/Icons';
import { automatedAnalysisContent } from '@/features/landing/content';

const cards = automatedAnalysisContent.cards.map((card, index) => ({
  ...card,
  icon: [
    <IconFotografia size={48} />,
    <IconAnalise size={48} />,
    <IconLocalizacao size={48} />,
    <IconEncaminhamento size={48} />,
  ][index],
}));

export default function AutomatedAnalysisSection() {
  return (
    <section id="analysis" className="w-full bg-kanda-dark border-t border-kanda-background/10">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 py-[120px]">
        <ScrollReveal className="text-center max-w-[720px] mx-auto mb-16">
          <span className="overline-label text-kanda-background/60 block mb-4">
            {automatedAnalysisContent.overline}
          </span>
          <h2 className="font-display text-[32px] md:text-[40px] lg:text-[48px] leading-[1.12] text-kanda-background">
            {automatedAnalysisContent.title}
          </h2>
          <p className="text-kanda-background/70 leading-relaxed mt-6">
            {automatedAnalysisContent.description}
          </p>
        </ScrollReveal>

        <ScrollReveal
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          stagger={0.1}
          distance={40}
          duration={0.7}
          childSelector=".analysis-card-wrapper"
        >
          {cards.map((card) => (
            <div key={card.title} className="analysis-card-wrapper">
              <StepCard icon={card.icon} title={card.title} description={card.description} />
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
