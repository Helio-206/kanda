import OperationalPage from './OperationalPage';

export default function InsightsPage() {
  return (
    <OperationalPage
      title="Insights"
      subtitle="Tendências, padrões territoriais e leitura operacional para decisões mais claras."
      highlights={[
        'Sinais agregados para entender pressão operacional.',
        'Padrões que ajudam a perceber áreas críticas e recorrências.',
        'Base de leitura para decisões, planeamento e resposta.',
      ]}
      primaryCta={{ label: 'Ver Plataforma', to: '/dashboard-entidades' }}
      secondaryCta={{ label: 'Abrir Mapa', to: '/mapa-administrativo' }}
    />
  );
}
