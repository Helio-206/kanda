import OperationalPage from './OperationalPage';

export default function MapaAdministrativoPage() {
  return (
    <OperationalPage
      title="Mapa Administrativo"
      subtitle="Leitura territorial das ocorrências para perceber concentração, clusters e cobertura."
      highlights={[
        'Distribuição espacial das ocorrências e do seu contexto.',
        'Visualização de clusters e pontos de maior pressão.',
        'Suporte ao planeamento territorial e à resposta operacional.',
      ]}
      primaryCta={{ label: 'Ver Plataforma', to: '/dashboard-entidades' }}
      secondaryCta={{ label: 'Abrir Insights', to: '/insights' }}
    />
  );
}
