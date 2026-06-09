import { BrowserRouter, Navigate, Routes, Route, useParams } from 'react-router';
import { LandingPage } from '@/features/landing';
import DashboardEntidadesPage from '@/pages/web/DashboardEntidadesPage';
import DashboardAdministrativoPage from '@/pages/web/DashboardAdministrativoPage';
import InsightsPage from '@/pages/web/InsightsPage';
import MapaAdministrativoPage from '@/pages/web/MapaAdministrativoPage';
import ReportarPage from '@/pages/ReportarPage';
import AcompanharPage from '@/pages/AcompanharPage';
import OcorrenciaPage from '@/pages/OcorrenciaPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard-entidades" element={<DashboardEntidadesPage />} />
        <Route path="/dashboard-administrativo" element={<DashboardAdministrativoPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/mapa-administrativo" element={<MapaAdministrativoPage />} />
        <Route path="/legacy/reportar" element={<ReportarPage />} />
        <Route path="/legacy/acompanhar" element={<AcompanharPage />} />
        <Route path="/legacy/ocorrencia/:codigo" element={<OcorrenciaPage />} />
        <Route path="/reportar" element={<Navigate to="/legacy/reportar" replace />} />
        <Route path="/acompanhar" element={<Navigate to="/legacy/acompanhar" replace />} />
        <Route path="/ocorrencia/:codigo" element={<LegacyOccurrenceRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function LegacyOccurrenceRedirect() {
  const { codigo } = useParams<{ codigo: string }>();
  return <Navigate to={`/legacy/ocorrencia/${codigo ?? ''}`} replace />;
}
