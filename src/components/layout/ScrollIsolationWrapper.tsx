"use client";

import { useEffect } from "react";

interface ScrollIsolationWrapperProps {
	children: React.ReactNode;
}

export default function ScrollIsolationWrapper({ children }: ScrollIsolationWrapperProps) {
	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			const target = e.target as Element;

			// 如果滾動事件來自 sidebar，阻止傳播到主內容
			if (target.closest('[data-sidebar="sidebar"]')) {
				e.stopPropagation();
				e.preventDefault();
			}
		};

		// 監聽 wheel 和 scroll 事件
		document.addEventListener('wheel', handleWheel, { capture: true, passive: false });

		return () => {
			document.removeEventListener('wheel', handleWheel, { capture: true });
		};
	}, []);

	return <>{children}</>;
}