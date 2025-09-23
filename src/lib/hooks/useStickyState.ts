"use client";

import { useEffect, useRef, useState } from "react";

interface UseStickyStateOptions {
	rootMargin?: string;
	threshold?: number;
}

export function useStickyState(options: UseStickyStateOptions = {}) {
	const { rootMargin = "0px", threshold = 0 } = options;
	const [isStuck, setIsStuck] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		const initObserver = () => {
			const sentinel = sentinelRef.current;

			if (!sentinel) {
				setTimeout(initObserver, 10);
				return;
			}

			observerRef.current = new IntersectionObserver(
				([entry]) => {
					setIsStuck(!entry.isIntersecting);
				},
				{
					root: null,
					rootMargin,
					threshold,
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
	}, [rootMargin, threshold]);

	return { isStuck, sentinelRef };
}
