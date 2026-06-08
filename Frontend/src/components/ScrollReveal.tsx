import { useRef, useEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
  scale?: number;
  className?: string;
  threshold?: string;
  childSelector?: string;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  distance = 30,
  duration = 0.8,
  delay = 0,
  stagger = 0,
  ease = 'power3.out',
  scale,
  className = '',
  threshold = 'top 85%',
  childSelector,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = childSelector ? el.querySelectorAll(childSelector) : el;

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      duration,
      delay,
      ease,
      stagger: stagger || undefined,
    };

    switch (direction) {
      case 'up':
        fromVars.y = distance;
        break;
      case 'down':
        fromVars.y = -distance;
        break;
      case 'left':
        fromVars.x = distance;
        break;
      case 'right':
        fromVars.x = -distance;
        break;
    }

    if (scale !== undefined) {
      fromVars.scale = scale;
    }

    const tween = gsap.from(targets, {
      ...fromVars,
      scrollTrigger: {
        trigger: el,
        start: threshold,
        toggleActions: 'play none none none',
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [direction, distance, duration, delay, stagger, ease, scale, threshold, childSelector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
