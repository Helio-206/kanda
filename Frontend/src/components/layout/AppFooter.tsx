import { Link } from 'react-router';

export default function AppFooter() {
  return (
    <footer className="border-t border-kanda-divider mt-16 pt-8 pb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-kanda-text-secondary">
        <p>KANDA — Plataforma inteligente de gestão de ocorrências</p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/reportar" className="hover:text-kanda-primary transition-colors no-underline">
            Nova ocorrência
          </Link>
          <Link to="/acompanhar" className="hover:text-kanda-primary transition-colors no-underline">
            Acompanhar
          </Link>
        </nav>
      </div>
    </footer>
  );
}
