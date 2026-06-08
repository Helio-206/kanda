interface BeneficioCardProps {
  title: string;
  items: string[];
}

export default function BeneficioCard({ title, items }: BeneficioCardProps) {
  return (
    <div className="card-standard h-full">
      <h3 className="font-display text-[25px] leading-[1.24] text-kanda-text-primary">
        {title}
      </h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-kanda-text-secondary leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-kanda-primary shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
