// Hook useScrollAnimation - Domelia.fr
// IntersectionObserver pour animer les éléments au scroll

"use client";

import { useEffect, useRef, useState, RefObject } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
}

// Hook pour plusieurs éléments
export function useScrollAnimationMultiple<T extends HTMLElement = HTMLDivElement>(
  count: number,
  options: UseScrollAnimationOptions = {}
): [RefObject<(T | null)[]>, boolean[]] {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const refs = useRef<(T | null)[]>([]);
  const [visibleStates, setVisibleStates] = useState<boolean[]>(
    () => Array(count).fill(false)
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    refs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setVisibleStates((prev) => {
            const newState = [...prev];
            newState[index] = entry.isIntersecting;
            return newState;
          });
          if (entry.isIntersecting && triggerOnce) {
            observer.unobserve(element);
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [count, threshold, rootMargin, triggerOnce]);

  return [refs, visibleStates];
}

// Hook pour le lazy loading des images
export function useLazyImage<T extends HTMLImageElement = HTMLImageElement>(
  src: string
): [RefObject<T | null>, boolean, string] {
  const ref = useRef<T>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && src) {
          setCurrentSrc(src);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [src]);

  useEffect(() => {
    if (currentSrc) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = currentSrc;
    }
  }, [currentSrc]);

  return [ref, isLoaded, currentSrc];
}

// Composant ScrollAnimate prêt à l'emploi
interface ScrollAnimateProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale" | "fade";
  delay?: number;
  threshold?: number;
}

export function ScrollAnimate({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  threshold = 0.1,
}: ScrollAnimateProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold });

  const animationStyles: Record<string, string> = {
    "fade-up": isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
    "fade-down": isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8",
    "fade-left": isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
    "fade-right": isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
    "scale": isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
    "fade": isVisible ? "opacity-100" : "opacity-0",
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${animationStyles[animation]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Composant pour lazy loading d'image avec fade-in
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export function LazyImage({
  src,
  alt,
  className = "",
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3C/svg%3E",
}: LazyImageProps) {
  const [ref, isLoaded, currentSrc] = useLazyImage<HTMLImageElement>(src);

  return (
    <img
      ref={ref}
      src={currentSrc || placeholder}
      alt={alt}
      className={`transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"} ${className}`}
      loading="lazy"
    />
  );
}

// Hook pour parallax léger
export function useParallax(strength: number = 0.1): [RefObject<HTMLDivElement | null>, (scrollY: number) => void] {
  const ref = useRef<HTMLDivElement>(null);

  const handleScroll = (scrollY: number) => {
    if (ref.current) {
      const offset = scrollY * strength;
      ref.current.style.transform = `translateY(${offset}px)`;
    }
  };

  return [ref, handleScroll];
}
