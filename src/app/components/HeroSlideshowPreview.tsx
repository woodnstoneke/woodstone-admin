import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  url: string;
  label: string;
  caption: string;
}

interface HeroSlideshowPreviewProps {
  images: Slide[];
}

export function HeroSlideshowPreview({ images }: HeroSlideshowPreviewProps) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 5000);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length]);

  const handleClick = (index: number) => {
    setActive(index);
    resetTimer();
  };

  const next = () => {
    setActive((prev) => (prev + 1) % images.length);
    resetTimer();
  };

  const prev = () => {
    setActive(
      (prev) => (prev - 1 + images.length) % images.length,
    );
    resetTimer();
  };

  if (images.length === 0) {
    return (
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{ height: "80vh", minHeight: "520px", backgroundColor: "var(--ws-bg)" }}
      >
        <p style={{ color: "var(--ws-text-muted)" }}>No slides to preview</p>
      </div>
    );
  }

  return (
    <section
      className="relative overflow-hidden w-full"
      style={{ height: "80vh", minHeight: "520px" }}
    >
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MOBILE: Fullscreen Slideshow                                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden h-full relative">
        {images.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: i === active ? 1 : 0,
              zIndex: i === active ? 1 : 0,
            }}
          >
            <img
              src={slide.url}
              alt={slide.label}
              className="w-full h-full object-cover"
            />
            {/* Dark gradient at bottom for caption visibility */}
            <div
              className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)",
              }}
            />
          </div>
        ))}

        {/* Caption */}
        <div className="absolute bottom-16 left-0 right-0 px-6 z-10">
          <div
            className="w-10 h-0.5 mb-4"
            style={{ background: "var(--ws-amber)" }}
          />
          <p
            className="text-xs tracking-[0.3em] uppercase mb-2"
            style={{
              color: "var(--ws-amber-light)",
              fontFamily: "var(--font-body)",
            }}
          >
            {images[active].label}
          </p>
          <p
            className="text-xl leading-relaxed"
            style={{
              color: "#f5ecd7",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            {images[active].caption}
          </p>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center transition-all duration-300"
          style={{
            background: "rgba(var(--ws-bg-rgb), 0.6)",
            border: "1px solid rgba(200,97,26,0.3)",
            color: "#f5ecd7",
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center transition-all duration-300"
          style={{
            background: "rgba(var(--ws-bg-rgb), 0.6)",
            border: "1px solid rgba(200,97,26,0.3)",
            color: "#f5ecd7",
          }}
        >
          <ChevronRight size={18} />
        </button>

        {/* Progress dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background:
                  i === active ? "var(--ws-amber)" : "rgba(255,255,255,0.4)",
                transform: i === active ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DESKTOP: Three-panel — side previews + dominant center          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex h-full gap-2 px-2">

        {/* Left preview — clicking navigates to prev */}
        <div
          onClick={prev}
          className="relative h-full cursor-pointer overflow-hidden flex-shrink-0 transition-all duration-700"
          style={{ width: "18%" }}
        >
          <img
            src={images[(active - 1 + images.length) % images.length].url}
            alt={images[(active - 1 + images.length) % images.length].label}
            className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.52)" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              className="text-xs tracking-[0.25em] uppercase"
              style={{
                color: "rgba(245,236,215,0.75)",
                fontFamily: "var(--font-body)",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
              }}
            >
              {images[(active - 1 + images.length) % images.length].label}
            </p>
          </div>
          <div className="absolute inset-y-0 right-0 w-px" style={{ background: "rgba(200,97,26,0.25)" }} />
        </div>

        {/* Center — dominant */}
        <div className="relative h-full overflow-hidden flex-1">
          <img
            src={images[active].url}
            alt={images[active].label}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
            style={{ transform: "scale(1.02)" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-3/4 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, transparent 100%)",
            }}
          />
          <div className="absolute top-8 left-8">
            <span
              className="text-6xl font-bold"
              style={{ color: "var(--ws-amber)", fontFamily: "var(--font-display)", opacity: 0.45 }}
            >
              0{active + 1}
            </span>
          </div>
          <div className="absolute bottom-14 left-8 right-8 z-10">
            <div className="w-12 h-0.5 mb-4" style={{ background: "var(--ws-amber)" }} />
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: "var(--ws-amber-light)", fontFamily: "var(--font-body)" }}
            >
              {images[active].label}
            </p>
            <p
              className="text-3xl leading-snug max-w-lg"
              style={{ color: "#f5ecd7", fontFamily: "var(--font-display)", fontStyle: "normal" }}
            >
              {images[active].caption}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "var(--ws-amber)" }} />
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center transition-all duration-300"
            style={{ background: "rgba(var(--ws-bg-rgb), 0.55)", border: "1px solid rgba(200,97,26,0.35)", color: "#f5ecd7" }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center transition-all duration-300"
            style={{ background: "rgba(var(--ws-bg-rgb), 0.55)", border: "1px solid rgba(200,97,26,0.35)", color: "#f5ecd7" }}
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i === active ? "var(--ws-amber)" : "rgba(255,255,255,0.35)",
                  transform: i === active ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right preview — clicking navigates to next */}
        <div
          onClick={next}
          className="relative h-full cursor-pointer overflow-hidden flex-shrink-0 transition-all duration-700"
          style={{ width: "18%" }}
        >
          <img
            src={images[(active + 1) % images.length].url}
            alt={images[(active + 1) % images.length].label}
            className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.52)" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              className="text-xs tracking-[0.25em] uppercase"
              style={{
                color: "rgba(245,236,215,0.75)",
                fontFamily: "var(--font-body)",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
              }}
            >
              {images[(active + 1) % images.length].label}
            </p>
          </div>
          <div className="absolute inset-y-0 left-0 w-px" style={{ background: "rgba(200,97,26,0.25)" }} />
        </div>

      </div>
    </section>
  );
}