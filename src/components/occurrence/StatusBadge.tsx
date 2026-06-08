import type { OccurrenceStatus } from '@/types/occurrence';

const STATUS_STYLES: Record<OccurrenceStatus, string> = {
  Reportado: 'bg-kanda-divider text-kanda-text-primary',
  Validado: 'bg-blue-100 text-blue-900',
  Encaminhado: 'bg-purple-100 text-purple-900',
  'Em análise': 'bg-amber-100 text-amber-900',
  'Em resolução': 'bg-orange-100 text-orange-900',
  Resolvido: 'bg-emerald-100 text-emerald-900',
};

interface StatusBadgeProps {
  status: OccurrenceStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
