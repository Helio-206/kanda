import { Link } from 'react-router';
import AppLayout from '@/components/layout/AppLayout';

interface OperationalPageProps {
  title: string;
  subtitle: string;
  highlights: string[];
  primaryCta: {
    label: string;
    to: string;
  };
  secondaryCta?: {
    label: string;
    to: string;
  };
}

export default function OperationalPage({
  title,
  subtitle,
  highlights,
  primaryCta,
  secondaryCta,
}: OperationalPageProps) {
  return (
    <AppLayout title={title} subtitle={subtitle} showVision={false}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card-standard space-y-4">
          <p className="overline-label text-kanda-primary">Plataforma operacional</p>
          <p className="text-kanda-text-secondary leading-relaxed">
            A Web do KANDA fica centrada em operação, gestão e leitura territorial. A experiência do cidadão vai ser movida para mobile.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to={primaryCta.to} className="btn-primary no-underline">
              {primaryCta.label}
            </Link>
            {secondaryCta && (
              <Link to={secondaryCta.to} className="btn-secondary no-underline">
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </section>

        <aside className="card-standard bg-kanda-dark text-kanda-background">
          <p className="overline-label text-kanda-primary">Foco desta área</p>
          <ul className="mt-4 space-y-3 text-sm text-kanda-background/75">
            {highlights.map((item) => (
              <li key={item} className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </AppLayout>
  );
}
