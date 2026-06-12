import { ArrowRight, ClipboardList, Clock3, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOperationalSnapshot } from './operationalData';

export default function DashboardEntidadesPage() {
  const snapshot = useOperationalSnapshot();
  const worklist = snapshot.worklist.slice(0, 5);

  return (
    <AppLayout
      title="Dashboard das Entidades"
      subtitle="Leitura rápida da fila, do volume e das prioridades."
      showVision={false}>
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-standard bg-kanda-dark text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="overline-label text-kanda-primary">Operação ativa</p>
                <h2 className="font-display text-[34px] leading-tight">Fila simples, ação rápida.</h2>
                <p className="max-w-2xl text-sm leading-relaxed text-white/76">
                  Menos ruído. Mais leitura.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
                  {snapshot.open} abertas
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
                  {snapshot.critical} críticas
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
                  {snapshot.averageScore} score
                </Badge>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Abertas</p>
                <p className="mt-2 text-3xl font-display">{snapshot.open}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Resolvidas</p>
                <p className="mt-2 text-3xl font-display">{snapshot.resolved}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Confirmadas</p>
                <p className="mt-2 text-3xl font-display">{snapshot.totalConfirmations}</p>
              </div>
            </div>
          </div>

          <aside className="card-standard space-y-4">
            <p className="overline-label text-kanda-primary">Leitura rápida</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">Entidade líder</p>
                <p className="mt-2 text-sm font-medium text-kanda-text-primary">
                  {snapshot.topEntity?.label ?? 'Sem entidade'}
                </p>
              </div>
              <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">Categoria líder</p>
                <p className="mt-2 text-sm font-medium text-kanda-text-primary">
                  {snapshot.topCategory?.label ?? 'Sem categoria'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/insights" className="btn-primary no-underline">
                Ver insights
              </Link>
              <Link to="/mapa-administrativo" className="btn-secondary no-underline">
                Abrir mapa
              </Link>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="card-standard space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-kanda-primary" size={18} />
              <h3 className="font-display text-[24px] text-kanda-text-primary">Ações agora</h3>
            </div>

            {worklist.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-kanda-border bg-kanda-background px-6 py-8 text-sm text-kanda-text-secondary">
                Sem actividade ainda.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ocorrência</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {worklist.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-kanda-text-primary">{item.category}</p>
                          <p className="text-xs text-kanda-text-secondary">{item.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-kanda-border">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-kanda-text-secondary">{item.responsibleEntity}</TableCell>
                      <TableCell className="text-right font-medium text-kanda-primary">
                        {item.scores.kandaScore}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="card-standard space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-kanda-primary" size={18} />
              <h3 className="font-display text-[24px] text-kanda-text-primary">Estado da operação</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {snapshot.statusDistribution.slice(0, 3).map((item) => (
                <div key={item.label} className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">{item.label}</p>
                  <p className="mt-2 text-2xl font-display text-kanda-text-primary">{item.count}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">Maior pressão</p>
                <p className="mt-2 font-medium text-kanda-text-primary">{snapshot.topArea?.label ?? 'Sem cluster'}</p>
              </div>
              <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">Maior volume</p>
                <p className="mt-2 font-medium text-kanda-text-primary">{snapshot.topCategory?.label ?? 'Sem categoria'}</p>
              </div>
              <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">Mais crítico</p>
                <p className="mt-2 font-medium text-kanda-text-primary">{snapshot.critical}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-kanda-border bg-kanda-dark p-5 text-white">
              <p className="overline-label text-kanda-primary">Atalho</p>
              <p className="mt-2 text-sm leading-relaxed text-white/78">
                A entidade só precisa do essencial: fila, volume e pressão.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/dashboard-administrativo" className="btn-primary no-underline">
                  Supervisão
                </Link>
                <Link to="/insights" className="btn-secondary no-underline bg-white text-kanda-text-primary">
                  Insights
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="card-standard space-y-4">
          <div className="flex items-center gap-2">
            <Clock3 className="text-kanda-primary" size={18} />
            <h3 className="font-display text-[24px] text-kanda-text-primary">Recentes</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.recent.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                to={`/legacy/ocorrencia/${item.code}`}
                className="rounded-2xl border border-kanda-border bg-kanda-background px-4 py-4 transition hover:border-kanda-primary/25 hover:bg-white">
                <p className="font-medium text-kanda-text-primary">{item.category}</p>
                <p className="mt-1 text-xs text-kanda-text-secondary">
                  {item.code} · {item.scores.kandaScore}
                </p>
                <ArrowRight className="mt-3 text-kanda-text-secondary" size={16} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
