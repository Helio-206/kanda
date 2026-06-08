import { VISION_FLOW } from '@/lib/copy/productLanguage';

export default function VisionFlow() {
  return (
    <div className="mb-10 -mx-5 border-y border-kanda-divider bg-white/80 px-5 py-4 md:-mx-10 md:px-10">
      <p className="overline-label text-kanda-primary mb-3 text-center">Fluxo operacional KANDA</p>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-kanda-text-secondary text-center">
        {VISION_FLOW.map((item, index) => (
          <span key={item.step} className="flex items-center gap-2">
            <span className="font-medium text-kanda-text-primary">{item.step}</span>
            {index < VISION_FLOW.length - 1 && (
              <span className="text-kanda-primary hidden sm:inline">→</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
