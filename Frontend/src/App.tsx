import { BrowserRouter, Navigate, Routes, Route } from 'react-router';
import { LandingPage } from '@/features/landing';
import ReportarPage from '@/pages/ReportarPage';
import AcompanharPage from '@/pages/AcompanharPage';
import OcorrenciaPage from '@/pages/OcorrenciaPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/reportar" element={<ReportarPage />} />
        <Route path="/acompanhar" element={<AcompanharPage />} />
        <Route path="/ocorrencia/:codigo" element={<OcorrenciaPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
