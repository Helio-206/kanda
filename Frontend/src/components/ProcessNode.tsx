import { useRef, useEffect, type ReactNode } from 'react';
import gsap from 'gsap';

interface ProcessNodeProps {
  icon: ReactNode;
  label: string;
  index: number;
  totalNodes: number;
}

export default function ProcessNode({ icon, label, index, totalNodes }: ProcessNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;

    const tween = gsap.from(el, {
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      delay: 0.8 + index * 0.15,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: el.closest('.process-flow-container'),
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    return () => { tween.kill(); };
  }, [index]);

  const isLast = index === totalNodes - 1;

  return (
    <div ref={nodeRef} className="flex flex-col items-center relative z-10 flex-1">
      <div className="group w-16 h-16 rounded-full border border-kanda-background/30 flex items-center justify-center transition-colors duration-300 hover:border-kanda-primary">
        <div className="text-kanda-background/90 group-hover:text-kanda-primary transition-colors duration-300">
          {icon}
        </div>
      </div>
      <span className="mt-4 text-[13px] text-kanda-background/70 text-center whitespace-nowrap">
        {label}
      </span>
      {!isLast && (
        <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-32px)] h-px bg-kanda-background/20" />
      )}
    </div>
  );
}
