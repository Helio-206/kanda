import OperationalPage from './OperationalPage';

export default function DashboardEntidadesPage() {
  return (
    <OperationalPage
      title="Dashboard das Entidades"
      subtitle="Leitura rápida das ocorrências, priorização operacional e acompanhamento territorial."
      highlights={[
        'Triagem e priorização das ocorrências recebidas.',
        'Leitura do mapa operacional e dos clusters visíveis.',
        'Acesso rápido ao detalhe para encaminhamento e decisão.',
      ]}
      primaryCta={{ label: 'Entrar no Painel', to: '/dashboard-entidades' }}
      secondaryCta={{ label: 'Ver Insights', to: '/insights' }}
    />
  );
}
