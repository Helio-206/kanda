import { Link } from 'react-router';
import ScrollReveal from '@/components/ScrollReveal';

interface FooterProps {
  onScrollTo: (target: string) => void;
}

export default function Footer({ onScrollTo }: FooterProps) {
  return (
    <footer className="w-full bg-kanda-dark">
      <ScrollReveal direction="up" distance={20} duration={0.6} threshold="top 95%">
        <div className="mx-auto px-5 md:px-10 lg:px-20 max-w-[1440px] pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr] gap-10 md:gap-8">
            <div>
              <Link
                to="/"
                className="font-display text-[28px] uppercase text-kanda-background hover:opacity-80 transition-opacity no-underline"
              >
                KANDA
              </Link>
              <p className="mt-4 text-sm text-kanda-background/60 max-w-xs">
                Plataforma inteligente para registar, qualificar e acompanhar ocorrências urbanas.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onScrollTo('analysis')}
                className="text-left text-sm text-kanda-background/70 hover:text-kanda-background transition-colors bg-transparent border-none cursor-pointer leading-[2.2]"
              >
                Análise automática
              </button>
              <Link to="/reportar" className="text-sm text-kanda-background/70 hover:text-kanda-background transition-colors no-underline leading-[2.2]">
                Nova ocorrência
              </Link>
              <Link to="/acompanhar" className="text-sm text-kanda-background/70 hover:text-kanda-background transition-colors no-underline leading-[2.2]">
                Acompanhar
              </Link>
            </div>

            <div className="flex items-end">
              <p className="text-xs text-kanda-background/40">
                &copy; 2026 KANDA. Todos os direitos reservados.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-kanda-background/10">
            <p className="text-xs text-kanda-background/30 text-center md:text-left">
              KANDA — Plataforma Inteligente de Gestão de Ocorrências
            </p>
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
}
