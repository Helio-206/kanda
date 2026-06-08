import type { ReactNode } from 'react';

interface StepCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function StepCard({ icon, title, description }: StepCardProps) {
  return (
    <div className="card-standard flex h-full flex-col">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-kanda-primary/10 text-kanda-primary">
        {icon}
      </div>
      <h3 className="font-display text-[26px] leading-[1.24] text-kanda-text-primary mt-6">
        {title}
      </h3>
      <p className="text-sm text-kanda-text-secondary leading-relaxed mt-3">
        {description}
      </p>
    </div>
  );
}
