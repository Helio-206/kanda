import type { OccurrenceHistoryEntry } from '@/types/occurrence';
import StatusBadge from './StatusBadge';

interface TimelineProps {
  history: OccurrenceHistoryEntry[];
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function Timeline({ history }: TimelineProps) {
  const items = [...history].reverse();

  return (
    <div className="space-y-0">
      {items.map((entry, index) => (
        <div key={`${entry.createdAt}-${entry.status}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-kanda-primary shrink-0 mt-1.5" />
            {index < items.length - 1 && (
              <div className="w-px flex-1 bg-kanda-divider min-h-[40px]" />
            )}
          </div>
          <div className="pb-8 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <StatusBadge status={entry.status} />
              <span className="text-xs text-kanda-text-secondary">{formatDate(entry.createdAt)}</span>
            </div>
            <p className="text-sm text-kanda-text-secondary leading-relaxed">{entry.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
