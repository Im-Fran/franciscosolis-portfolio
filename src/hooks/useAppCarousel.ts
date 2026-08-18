import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export const useAppCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({align: "start", loop: false, dragFree: false});
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const rootNode = emblaApi.rootNode();
    let locked = false;

    const onWheel = (event: WheelEvent) => {
      const delta = event.deltaX;
      if (Math.abs(delta) <= Math.abs(event.deltaY) || delta === 0) return;
      event.preventDefault();
      if (locked) return;
      locked = true;
      if (delta > 0) emblaApi.scrollNext(); else emblaApi.scrollPrev();
      window.setTimeout(() => { locked = false; }, 300);
    };

    rootNode.addEventListener("wheel", onWheel, {passive: false});
    return () => rootNode.removeEventListener("wheel", onWheel);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return {emblaRef, scrollPrev, scrollNext, canScrollPrev, canScrollNext};
};
