import type { ReactNode } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import VisionFlow from '@/components/occurrence/VisionFlow';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showVision?: boolean;
}

export default function AppLayout({
  children,
  title,
  subtitle,
  showVision = true,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-kanda-background">
      <AppHeader />
      <main className="max-w-[1120px] mx-auto px-5 md:px-10 py-10 md:py-16">
        {showVision && <VisionFlow />}
        {(title || subtitle) && (
          <div className="mb-10">
            {title && (
              <h1 className="font-display text-[36px] md:text-[48px] leading-[1.1] text-kanda-text-primary">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-kanda-text-secondary mt-3 leading-relaxed max-w-2xl">{subtitle}</p>
            )}
          </div>
        )}
        {children}
        <AppFooter />
      </main>
    </div>
  );
}
