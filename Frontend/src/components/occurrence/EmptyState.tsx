import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="card-standard text-center py-16 px-8">
      <h3 className="font-display text-[28px] text-kanda-text-primary">{title}</h3>
      <p className="text-kanda-text-secondary mt-3 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
