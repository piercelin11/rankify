"use client";

import { useEffect, useRef, useState } from "react";

export function useStickyState() {
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const initObserver = () => {
      const sentinel = sentinelRef.current;

      if (!sentinel) {
        // 如果元素還沒渲染，重試
        setTimeout(initObserver, 10);
        return;
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          // When sentinel is NOT intersecting (out of view), header is stuck
          setIsStuck(!entry.isIntersecting);
        },
        {
          root: null, // Use viewport as root
          rootMargin: "0px",
          threshold: 0,
        }
      );

      observerRef.current.observe(sentinel);
    };

    initObserver();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { isStuck, sentinelRef };
}