import ScrollReveal from '@/components/ScrollReveal';

export default function ProblemaSection() {
  return (
    <section id="problema" className="w-full border-t border-kanda-divider">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 py-[120px]">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left Column */}
          <ScrollReveal className="flex-1" delay={0}>
            <span className="overline-label text-kanda-primary block mb-4">
              DESAFIO OPERACIONAL
            </span>
            <h2 className="font-display text-[32px] md:text-[40px] lg:text-[48px] leading-[1.12] text-kanda-text-primary">
              A maior parte das ocorrências chega sem contexto suficiente.
            </h2>
          </ScrollReveal>

          {/* Right Column */}
          <ScrollReveal className="flex-1 max-w-[480px] lg:pt-10" delay={0.2}>
            <p className="text-kanda-text-secondary leading-relaxed">
              Fotografias, mensagens e reclamações dispersas dificultam a triagem. Sem categoria, localização, prioridade e histórico, a equipa perde tempo a interpretar o problema antes mesmo de decidir o que fazer.
            </p>
            <div className="mt-6 pl-4 border-l-2 border-kanda-primary">
              <p className="text-kanda-text-primary leading-relaxed">
                O KANDA organiza a entrada da ocorrência desde o primeiro momento, criando uma base mais profissional para acompanhamento e decisão.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
