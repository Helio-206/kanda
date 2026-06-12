import {
  ArrowUpRight,
  BellRing,
  BrainCircuit,
  Lightbulb,
  LocateFixed,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { useOperationalSnapshot } from './operationalData';

function InsightCard({
  title,
  icon: Icon,
  body,
  accent = 'default',
}: {
  title: string;
  icon: LucideIcon;
  body: string;
  accent?: 'default' | 'warning' | 'success';
}) {
  const styles =
    accent === 'warning'
      ? 'border-amber-200 bg-amber-50/60'
      : accent === 'success'
        ? 'border-emerald-200 bg-emerald-50/60'
        : 'border-kanda-border bg-white';

  return (
    <div className={`card-standard ${styles} space-y-3`}>
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-kanda-primary" />
        <h3 className="font-display text-[22px] text-kanda-text-primary">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-kanda-text-secondary">{body}</p>
    </div>
  );
}

export default function InsightsPage() {
  const snapshot = useOperationalSnapshot();

  const dominantCategory = snapshot.topCategory?.label ?? 'Sem categoria dominante';
  const dominantArea = snapshot.topArea?.label ?? 'Sem concentração visível';

  return (
    <AppLayout
      title="Insights"
      subtitle="Leitura territorial, padrões operacionais e sinais que ajudam a decidir antes de a pressão crescer."
      showVision={false}>
      <div className="space-y-6">
        <section className="card-standard bg-kanda-dark text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="overline-label text-kanda-primary">Decisão assistida</p>
              <h2 className="font-display text-[34px] leading-tight">Os sinais já estão a falar.</h2>
              <p className="max-w-3xl text-sm leading-relaxed text-white/76">
                Esta página existe para transformar ocorrências em leitura estratégica. A equipa não deve
                ter de adivinhar onde a pressão está a crescer.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
                {snapshot.trend.length} janelas
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
                {snapshot.averageScore} score médio
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
                {snapshot.averageConfidence}% confiança
              </Badge>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Categoria dominante</p>
              <p className="mt-2 text-sm font-medium text-white">{dominantCategory}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Área mais pressionada</p>
              <p className="mt-2 text-sm font-medium text-white">{dominantArea}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Sinal comunitário</p>
              <p className="mt-2 text-sm font-medium text-white">
                {snapshot.totalConfirmations > 0
                  ? `${snapshot.totalConfirmations} confirmações já reforçam o território.`
                  : 'Ainda não há confirmações suficientes para sinais fortes.'}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6">
            <InsightCard
              title="O que está a crescer"
              icon={TrendingUp}
              accent="warning"
              body={
                snapshot.trend.length === 0
                  ? 'Ainda não existem janelas temporais suficientes para mostrar tendência.'
                  : `O comportamento recente mostra ${snapshot.trend[snapshot.trend.length - 1]?.count ?? 0} ocorrências na janela mais recente, o que ajuda a perceber se a pressão está a acelerar ou a estabilizar.`
              }
            />
            <InsightCard
              title="Onde a resposta deve começar"
              icon={LocateFixed}
              accent="success"
              body={
                snapshot.topArea
                  ? `${snapshot.topArea.label} concentra mais casos e deve ser lida primeiro pela operação.`
                  : 'Ainda não existe uma zona dominante; a página vai ficar mais útil à medida que surgirem ocorrências.'
              }
            />
            <InsightCard
              title="O que a comunidade já está a validar"
              icon={BellRing}
              body={
                snapshot.totalConfirmations > 0
                  ? 'As confirmações comunitárias já ajudam a dar confiança ao território e a reforçar a leitura do caso.'
                  : 'A credibilidade comunitária ainda está a começar. Esta camada ganha valor quando os cidadãos passam a confirmar sinais próximos.'
              }
            />
          </div>

          <div className="space-y-6">
            <div className="card-standard space-y-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="text-kanda-primary" size={18} />
                <h3 className="font-display text-[24px] text-kanda-text-primary">Narrativa de decisão</h3>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-kanda-text-secondary">
                <p>
                  A análise não deve ser apenas uma lista de números. Deve responder a perguntas de
                  governação: onde está a pressão, o que está a repetir, o que já está a cair e que entidade
                  precisa de agir primeiro.
                </p>
                <p>
                  Quando uma equipa abre esta página, precisa de sair com um ponto de partida, não com mais
                  ruído.
                </p>
              </div>
            </div>

            <div className="card-standard space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="text-kanda-primary" size={18} />
                  <h3 className="font-display text-[24px] text-kanda-text-primary">Sinais úteis</h3>
                </div>
                <Link to="/dashboard-administrativo" className="btn-secondary no-underline">
                  Abrir supervisão
                </Link>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">Volume</p>
                  <p className="mt-2 text-sm font-medium text-kanda-text-primary">
                    {snapshot.total > 0
                      ? `${snapshot.total} ocorrências compõem a leitura atual.`
                      : 'Sem ocorrências ainda, a leitura fica em aberto.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">Pressão crítica</p>
                  <p className="mt-2 text-sm font-medium text-kanda-text-primary">
                    {snapshot.critical > 0
                      ? `${snapshot.critical} casos pedem atenção imediata.`
                      : 'Sem sinal crítico no momento.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-kanda-text-secondary">Consolidação</p>
                  <p className="mt-2 text-sm font-medium text-kanda-text-primary">
                    {snapshot.resolved > 0
                      ? `${snapshot.resolved} casos já foram resolvidos, o que dá leitura de evolução.`
                      : 'Ainda não há casos resolvidos para contar uma linha de evolução.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-standard bg-kanda-dark text-white">
              <p className="overline-label text-kanda-primary">Chamada da página</p>
              <p className="mt-2 text-sm leading-relaxed text-white/78">
                Os insights funcionam melhor quando a operação, o mapa e a fila de trabalho falam a mesma
                língua. Esta superfície fecha o ciclo entre o que está a acontecer e o que precisa de decisão.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/mapa-administrativo" className="btn-primary no-underline">
                  Ler território
                </Link>
                <Link to="/dashboard-entidades" className="btn-secondary no-underline bg-white text-kanda-text-primary">
                  Voltar à fila
                </Link>
              </div>
            </div>
          </div>
        </section>

        {snapshot.categoryDistribution.length > 0 ? (
          <section className="card-standard space-y-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="text-kanda-primary" size={18} />
              <h3 className="font-display text-[24px] text-kanda-text-primary">Categoria dominante e leitura comparada</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {snapshot.categoryDistribution.slice(0, 6).map((item) => (
                <div key={item.label} className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                  <p className="font-medium text-kanda-text-primary">{item.label}</p>
                  <p className="mt-1 text-xs text-kanda-text-secondary">
                    {item.count} casos · {item.share}% do total
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-kanda-primary"
                      style={{ width: `${Math.max(8, item.share)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppLayout>
  );
}
