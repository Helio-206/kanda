import { Link } from 'react-router';

export default function AppFooter() {
  return (
    <footer className="border-t border-kanda-divider mt-16 pt-8 pb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-kanda-text-secondary">
        <p>KANDA — Plataforma institucional para gestão de ocorrências</p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/dashboard-entidades" className="hover:text-kanda-primary transition-colors no-underline">
            Dashboard das Entidades
          </Link>
          <Link to="/insights" className="hover:text-kanda-primary transition-colors no-underline">
            Insights
          </Link>
          <Link to="/mapa-administrativo" className="hover:text-kanda-primary transition-colors no-underline">
            Mapa Administrativo
          </Link>
        </nav>
      </div>
    </footer>
  );
}
