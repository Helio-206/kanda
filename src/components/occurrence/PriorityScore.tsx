interface PriorityScoreProps {
  priority: number;
}

export default function PriorityScore({ priority }: PriorityScoreProps) {
  const level = priority >= 85 ? 'Alta' : priority >= 70 ? 'Média' : 'Normal';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-kanda-text-secondary">Prioridade</span>
        <span className="font-medium text-kanda-text-primary">{priority}/100 · {level}</span>
      </div>
      <div className="h-2 w-full bg-kanda-divider overflow-hidden">
        <div
          className="h-full bg-kanda-primary transition-all duration-500"
          style={{ width: `${priority}%` }}
        />
      </div>
    </div>
  );
}
