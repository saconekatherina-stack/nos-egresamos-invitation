import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("reveal", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Ornament() {
  return (
    <div className="mx-auto my-5 flex items-center justify-center gap-3 text-lilac" aria-hidden="true">
      <span className="h-px w-12 bg-lilac" />
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c1.5 3 1.5 5 0 8-1.5-3-1.5-5 0-8Zm0 20c-1.5-3-1.5-5 0-8 1.5 3 1.5 5 0 8ZM2 12c3-1.5 5-1.5 8 0-3 1.5-5 1.5-8 0Zm20 0c-3 1.5-5 1.5-8 0 3-1.5 5-1.5 8 0Z" />
      </svg>
      <span className="h-px w-12 bg-lilac" />
    </div>
  );
}

export function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-medium text-gradient sm:text-5xl">{title}</h2>
      <Ornament />
    </div>
  );
}
