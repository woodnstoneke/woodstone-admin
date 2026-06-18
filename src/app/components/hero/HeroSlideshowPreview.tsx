import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroSlide } from './heroContent';

interface HeroSlideshowPreviewProps {
  slides: HeroSlide[];
  autoPlayInterval?: number;
}

export function HeroSlideshowPreview({ slides, autoPlayInterval = 5000 }: HeroSlideshowPreviewProps) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, autoPlayInterval]);

  const handleClick = (index: number) => {
    setActive(index);
    resetTimer();
  };

  const next = () => {
    setActive((prev) => (prev + 1) % slides.length);
    resetTimer();
  };

  const prev = () => {
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
    resetTimer();
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: '80vh', minHeight: '520px' }}
    >
      <div className="lg:hidden h-full relative">
        {slides.map((slide, i) => (
          <div
            key={slide.url}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: i === active ? 1 : 0,
              zIndex: i === active ? 1 : 0,
            }}
          >
            <img src={slide.url} alt={slide.label} className="w-full h-full object-cover" />
            <div
              className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)',
              }}
            />
          </div>
        ))}

        <div className="absolute bottom-16 left-0 right-0 px-6 z-10">
          <div className="w-10 h-0.5 mb-4" style={{ background: 'var(--ws-amber)' }} />
          <p
            className="text-xs tracking-[0.3em] uppercase mb-2"
            style={{
              color: 'var(--ws-amber-light)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {slides[active].label}
          </p>
          <p
            className="text-xl leading-relaxed"
            style={{
              color: '#f5ecd7',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
            }}
          >
            {slides[active].caption}
          </p>
        </div>

        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center transition-all duration-300"
          style={{
            background: 'rgba(var(--ws-bg-rgb), 0.6)',
            border: '1px solid rgba(200,97,26,0.3)',
            color: '#f5ecd7',
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center transition-all duration-300"
          style={{
            background: 'rgba(var(--ws-bg-rgb), 0.6)',
            border: '1px solid rgba(200,97,26,0.3)',
            color: '#f5ecd7',
          }}
        >
          <ChevronRight size={18} />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i === active ? 'var(--ws-amber)' : 'rgba(255,255,255,0.4)',
                transform: i === active ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="hidden lg:flex h-full">
        {slides.map((slide, i) => {
          const isActive = i === active;
          return (
            <div
              key={slide.url}
              onClick={() => handleClick(i)}
              className="relative h-full cursor-pointer overflow-hidden transition-all duration-700 ease-in-out"
              style={{
                flex: isActive ? 4 : 1,
                minWidth: isActive ? '50%' : '0%',
              }}
            >
              <img
                src={slide.url}
                alt={slide.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                style={{
                  transform: isActive ? 'scale(1)' : 'scale(1.1)',
                }}
              />

              <div
                className="absolute inset-0 transition-all duration-500"
                style={{
                  background: isActive
                    ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)'
                    : 'rgba(0,0,0,0.5)',
                }}
              />

              <div
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
                style={{
                  opacity: isActive ? 0 : 1,
                  pointerEvents: isActive ? 'none' : 'auto',
                }}
              >
                <p
                  className="text-sm tracking-[0.25em] uppercase font-medium whitespace-nowrap"
                  style={{
                    color: '#f5ecd7',
                    fontFamily: 'var(--font-body)',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {slide.label}
                </p>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 p-8 transition-all duration-500"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <div className="w-12 h-0.5 mb-4" style={{ background: 'var(--ws-amber)' }} />
                <p
                  className="text-xs tracking-[0.3em] uppercase mb-2"
                  style={{
                    color: 'var(--ws-amber-light)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {slide.label}
                </p>
                <p
                  className="text-2xl leading-relaxed max-w-lg"
                  style={{
                    color: '#f5ecd7',
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                  }}
                >
                  {slide.caption}
                </p>
              </div>

              <div
                className="absolute top-6 left-6 transition-opacity duration-500"
                style={{ opacity: isActive ? 1 : 0 }}
              >
                <span
                  className="text-5xl font-bold"
                  style={{
                    color: 'var(--ws-amber)',
                    fontFamily: 'var(--font-display)',
                    opacity: 0.5,
                  }}
                >
                  0{i + 1}
                </span>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-500"
                style={{
                  background: 'var(--ws-amber)',
                  transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                }}
              />

              {i < slides.length - 1 && (
                <div
                  className="absolute top-0 right-0 w-px h-full"
                  style={{ background: 'rgba(200,97,26,0.3)' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
