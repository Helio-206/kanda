import { BarChart3, Building2, Gauge, LandPlot, Users2, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { useOperationalSnapshot } from './operationalData';

function KPI({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="card-standard space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="overline-label text-kanda-text-secondary">{label}</p>
        <Icon size={18} className="text-kanda-primary" />
      </div>
      <p className="font-display text-[34px] leading-none text-kanda-text-primary">{value}</p>
    </div>
  );
}

export default function DashboardAdministrativoPage() {
  const snapshot = useOperationalSnapshot();
  const trendMax = Math.max(1, ...snapshot.trend.map((item) => item.count));

  return (
    <AppLayout
      title="Dashboard Administrativo"
      subtitle="Supervisão institucional em formato curto."
      showVision={false}>
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-standard bg-kanda-dark text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="overline-label text-kanda-primary">Governação</p>
                <h2 className="font-display text-[34px] leading-tight">Leitura executiva.</h2>
                <p className="max-w-2xl text-sm leading-relaxed text-white/76">
                  O foco é saúde da operação, pressão e entidades com mais carga.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
                  {snapshot.total} total
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
                  {snapshot.averageConfidence}% confiança
                </Badge>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Volume</p>
                <p className="mt-2 text-3xl font-display">{snapshot.total}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Abertas</p>
                <p className="mt-2 text-3xl font-display">{snapshot.open}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Críticas</p>
                <p className="mt-2 text-3xl font-display">{snapshot.critical}</p>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <KPI label="Score médio" value={`${snapshot.averageScore}`} icon={Gauge} />
            <KPI label="Confirmações" value={`${snapshot.totalConfirmations}`} icon={Users2} />
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="card-standard space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-kanda-primary" size={18} />
              <h3 className="font-display text-[24px] text-kanda-text-primary">Tendência</h3>
            </div>

            {snapshot.trend.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-kanda-border bg-kanda-background px-6 py-8 text-sm text-kanda-text-secondary">
                Sem tendência visível ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {snapshot.trend.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-kanda-text-primary">{item.label}</span>
                      <span className="text-kanda-text-secondary">{item.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-kanda-map-land">
                      <div
                        className="h-full rounded-full bg-kanda-primary"
                        style={{ width: `${Math.max(8, Math.round((item.count / trendMax) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-standard space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="text-kanda-primary" size={18} />
              <h3 className="font-display text-[24px] text-kanda-text-primary">Entidades com mais carga</h3>
            </div>

            <div className="space-y-3">
              {snapshot.entityDistribution.slice(0, 4).map((entity) => (
                <div key={entity.label} className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                  <p className="font-medium text-kanda-text-primary">{entity.label}</p>
                  <p className="mt-1 text-xs text-kanda-text-secondary">
                    {entity.count} casos · {entity.confirmations} confirmações
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Link to="/dashboard-entidades" className="btn-primary no-underline">
                Ver fila
              </Link>
              <Link to="/mapa-administrativo" className="btn-secondary no-underline">
                Ver mapa
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="card-standard space-y-4">
            <div className="flex items-center gap-2">
              <LandPlot className="text-kanda-primary" size={18} />
              <h3 className="font-display text-[24px] text-kanda-text-primary">Visão geral</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">Categoria líder</p>
                <p className="mt-2 text-sm font-medium text-kanda-text-primary">
                  {snapshot.topCategory?.label ?? 'Sem categoria'}
                </p>
              </div>
              <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">Zona líder</p>
                <p className="mt-2 text-sm font-medium text-kanda-text-primary">
                  {snapshot.topArea?.label ?? 'Sem zona'}
                </p>
              </div>
              <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">Mais crítico</p>
                <p className="mt-2 text-sm font-medium text-kanda-text-primary">{snapshot.critical}</p>
              </div>
            </div>
          </div>

          <div className="card-standard space-y-4">
            <p className="overline-label text-kanda-primary">Atalho</p>
            <p className="text-sm leading-relaxed text-kanda-text-secondary">
              Para supervisão, o essencial é suficiente.
            </p>
            <div className="rounded-2xl border border-kanda-border bg-kanda-dark p-5 text-white">
              <p className="text-sm leading-relaxed text-white/78">
                A plataforma fica mais clara quando o mapa e a fila falam a mesma língua.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/insights" className="btn-primary no-underline">
                  Insights
                </Link>
                <Link to="/dashboard-entidades" className="btn-secondary no-underline bg-white text-kanda-text-primary">
                  Fila
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
