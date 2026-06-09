import { Link, useLocation } from 'react-router';

export default function AppHeader() {
  const location = useLocation();

  const linkClass = (path: string) =>
    location.pathname.startsWith(path) ? 'nav-link text-kanda-primary' : 'nav-link';

  return (
    <header
      className="sticky top-0 z-[1000] border-b border-kanda-border"
      style={{
        backgroundColor: 'rgba(247, 250, 248, 0.94)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        height: '72px',
      }}
    >
      <div className="flex items-center justify-between h-full mx-auto px-5 md:px-10 lg:px-20 max-w-[1440px]">
        <Link
          to="/"
          className="font-display text-[28px] uppercase text-kanda-text-primary hover:opacity-70 transition-opacity no-underline select-none"
        >
          KANDA
        </Link>

        <nav className="flex items-center gap-4 md:gap-6">
          <Link to="/dashboard-entidades" className={`${linkClass('/dashboard-entidades')} no-underline hidden lg:inline-block`}>
            Dashboard das Entidades
          </Link>
          <Link to="/dashboard-administrativo" className={`${linkClass('/dashboard-administrativo')} no-underline hidden xl:inline-block`}>
            Dashboard Administrativo
          </Link>
          <Link to="/insights" className={`${linkClass('/insights')} no-underline hidden md:inline-block`}>
            Insights
          </Link>
          <Link to="/mapa-administrativo" className={`${linkClass('/mapa-administrativo')} no-underline hidden xl:inline-block`}>
            Mapa Administrativo
          </Link>
          <Link to="/dashboard-entidades" className="btn-primary text-sm py-3 px-5 md:py-4 md:px-8 no-underline">
            Entrar no Painel
          </Link>
        </nav>
      </div>
    </header>
  );
}
