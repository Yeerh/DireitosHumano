import { useEffect, useState } from "react";
import Dither from "@/components/Dither";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

export default function BackgroundDither() {
  const reducedMotion = usePrefersReducedMotion();
  const isSmall = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Dither
        waveColor={[0.15, 0.39, 0.92]} // aproximação de #2664eb em 0..1
        disableAnimation={reducedMotion}
        enableMouseInteraction={!isSmall}
        mouseRadius={1}
        colorNum={4}
        pixelSize={isSmall ? 3 : 2}
        waveAmplitude={0.3}
        waveFrequency={3}
        waveSpeed={0.05}
      />
    </div>
  );
}
