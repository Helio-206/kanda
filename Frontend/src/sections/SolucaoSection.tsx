import ScrollReveal from '@/components/ScrollReveal';
import StepCard from '@/components/StepCard';
import { IconReporte, IconAnalise, IconEncaminhamento } from '@/components/Icons';

const steps = [
  {
    icon: <IconReporte size={48} />,
    title: 'Registo',
    description: 'A ocorrência entra com fotografia, localização e observação contextual.',
  },
  {
    icon: <IconAnalise size={48} />,
    title: 'Qualificação',
    description: 'O motor de análise estrutura categoria, risco, impacto, confiança e prioridade.',
  },
  {
    icon: <IconEncaminhamento size={48} />,
    title: 'Acompanhamento',
    description: 'O registo recebe um código único, histórico e indicação de próxima ação.',
  },
];

export default function SolucaoSection() {
  return (
    <section id="solucao" className="w-full border-t border-kanda-divider">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 py-[120px]">
        {/* Header */}
        <ScrollReveal className="text-center max-w-[640px] mx-auto mb-16">
          <span className="overline-label text-kanda-primary block mb-4">
            A SOLUÇÃO
          </span>
          <h2 className="font-display text-[32px] md:text-[40px] lg:text-[48px] leading-[1.12] text-kanda-text-primary">
            Uma entrada simples. Um registo pronto para decisão.
          </h2>
        </ScrollReveal>

        {/* Cards Grid */}
        <ScrollReveal
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          stagger={0.12}
          distance={40}
          duration={0.7}
          childSelector=".step-card-wrapper"
        >
          {steps.map((step) => (
            <div key={step.title} className="step-card-wrapper">
              <StepCard
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
