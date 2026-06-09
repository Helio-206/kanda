import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { navLinks } from '@/features/landing/content';

interface NavigationProps {
  onScrollTo: (target: string) => void;
}

export default function Navigation({ onScrollTo }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = useCallback((target: string) => {
    setMobileOpen(false);
    onScrollTo(target);
  }, [onScrollTo]);

  const handleRouteClick = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-[1000] transition-shadow duration-300"
        style={{
          backgroundColor: 'rgba(247, 250, 248, 0.94)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(7, 21, 18, 0.1)',
          boxShadow: scrolled ? '0 10px 30px rgba(7, 21, 18, 0.07)' : 'none',
          height: '72px',
        }}
      >
        <div className="flex items-center justify-between h-full mx-auto px-5 md:px-10 lg:px-20 max-w-[1440px]">
          <Link
            to="/"
            className="font-display text-[28px] uppercase text-kanda-text-primary hover:opacity-70 transition-opacity no-underline"
          >
            KANDA
          </Link>

          <div className="hidden lg:flex items-center gap-5 xl:gap-6">
            {navLinks.map((link) => (
              'href' in link ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="nav-link no-underline whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.target)}
                  className="nav-link bg-transparent border-none cursor-pointer whitespace-nowrap"
                >
                  {link.label}
                </button>
              )
            ))}
            <Link to="/dashboard-entidades" className="btn-primary ml-1 no-underline whitespace-nowrap">
              Entrar no Painel
            </Link>
          </div>

          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 bg-transparent border-none cursor-pointer"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={20} strokeWidth={2} className="text-kanda-text-primary" />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[2000] flex">
          <div
            className="absolute inset-0 bg-kanda-dark/50"
            onClick={() => setMobileOpen(false)}
            style={{ animation: 'fadeIn 0.3s ease forwards' }}
          />
          <div
            className="relative ml-auto w-full max-w-sm bg-kanda-background h-full flex flex-col"
            style={{ animation: 'slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' }}
          >
            <div className="flex items-center justify-end p-5">
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-10 h-10 bg-transparent border-none cursor-pointer"
                aria-label="Fechar menu"
              >
                <X size={24} strokeWidth={2} className="text-kanda-text-primary" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-8 px-8">
              {navLinks.map((link, i) => (
                'href' in link ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={handleRouteClick}
                    className="font-display text-[28px] text-center text-kanda-text-primary no-underline hover:text-kanda-primary transition-colors"
                    style={{
                      animation: `fadeSlideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 + i * 0.08}s both`,
                    }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.target)}
                    className="font-display text-[28px] text-center text-kanda-text-primary bg-transparent border-none cursor-pointer hover:text-kanda-primary transition-colors"
                    style={{
                      animation: `fadeSlideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 + i * 0.08}s both`,
                    }}
                  >
                    {link.label}
                  </button>
                )
              ))}
              <Link
                to="/dashboard-entidades"
                onClick={handleRouteClick}
                className="btn-primary mt-4 no-underline"
              >
                Entrar no Painel
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
