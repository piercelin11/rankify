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
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;

		const scrollContainer = sentinel.closest('[data-scroll-container]') as HTMLElement;
		if (!scrollContainer) return;

		// 解析 rootMargin (只處理 px 單位，支援負值)
		const marginOffset = parseRootMargin(rootMargin);

		// Scroll handler: 使用 RAF 確保在 repaint 前執行
		const checkSticky = () => {
			if (!sentinel || !scrollContainer) return;

			const sentinelRect = sentinel.getBoundingClientRect();
			const containerRect = scrollContainer.getBoundingClientRect();

			// 計算 sentinel 相對於 scroll container 的位置
			const sentinelTopRelative = sentinelRect.top - containerRect.top;

			// 判斷是否 stuck: sentinel 位置 < threshold (考慮 rootMargin)
			const stuck = sentinelTopRelative < threshold + marginOffset;

			setIsStuck(stuck);
		};

		// 使用 RAF 確保同步更新，但避免過度重繪
		const handleScroll = () => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
			}
			rafRef.current = requestAnimationFrame(checkSticky);
		};

		// 初始檢查
		checkSticky();

		// 監聽 scroll event (passive 優化效能)
		scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			scrollContainer.removeEventListener("scroll", handleScroll);
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, [rootMargin, threshold]);

	return { isStuck, sentinelRef };
}

// Helper: 解析 rootMargin (只處理簡單的 "-140px" 格式)
function parseRootMargin(rootMargin: string): number {
	const match = rootMargin.match(/^(-?\d+)px$/);
	return match ? parseInt(match[1], 10) : 0;
}
