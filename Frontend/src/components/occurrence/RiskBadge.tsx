import type { RiskLevel } from '@/types/occurrence';

const RISK_STYLES: Record<RiskLevel, string> = {
  Baixo: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Médio: 'bg-amber-50 text-amber-800 border-amber-200',
  Alto: 'bg-orange-50 text-orange-800 border-orange-200',
  Crítico: 'bg-red-50 text-red-800 border-red-200',
};

interface RiskBadgeProps {
  risk: RiskLevel;
}

export default function RiskBadge({ risk }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${RISK_STYLES[risk]}`}
    >
      Risco {risk}
    </span>
  );
}
