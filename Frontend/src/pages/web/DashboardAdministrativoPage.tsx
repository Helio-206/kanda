import OperationalPage from './OperationalPage';

export default function DashboardAdministrativoPage() {
  return (
    <OperationalPage
      title="Dashboard Administrativo"
      subtitle="Visão de governança, saúde da plataforma e leitura executiva da operação."
      highlights={[
        'Acompanhamento da operação por área e por entidade.',
        'Visão de estado geral da plataforma e do fluxo institucional.',
        'Ponto central para supervisão e gestão administrativa.',
      ]}
      primaryCta={{ label: 'Entrar no Painel', to: '/dashboard-administrativo' }}
      secondaryCta={{ label: 'Abrir Mapa', to: '/mapa-administrativo' }}
    />
  );
}
