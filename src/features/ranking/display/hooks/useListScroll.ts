"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FixedSizeList, ListOnScrollProps } from "react-window";

export const SCROLL_SESSION_KEY = "rankingListScrollPosition"

export default function useListScroll() {
	const [listInstance, setListInstance] = useState<FixedSizeList | null>(null);
	const currentScrollOffsetRef = useRef<number>(0);
	const listRefCallback = useCallback((node: FixedSizeList | null) => {
		if (node) {
			setListInstance(node);
		} else {
			setListInstance(null);
		}
	}, []);

	useEffect(() => {
		const savedOffset = sessionStorage.getItem(SCROLL_SESSION_KEY);
		if (savedOffset !== null && listInstance) {
			const offset = parseInt(savedOffset, 10);
			if (!isNaN(offset)) {
				listInstance.scrollTo(offset);
			}
			sessionStorage.removeItem(SCROLL_SESSION_KEY);
		}
	}, [listInstance]);

	const handleRowClick = useCallback(() => {
		const currentOffset = currentScrollOffsetRef.current;
		if (currentOffset > 0) {
			sessionStorage.setItem(SCROLL_SESSION_KEY, String(currentOffset));
		} else {
			sessionStorage.removeItem(SCROLL_SESSION_KEY);
		}
	}, []);

	const handleListScroll = useCallback(
		({ scrollOffset }: ListOnScrollProps) => {
			currentScrollOffsetRef.current = scrollOffset;
		},
		[]
	);

	return {
		listRefCallback,
		handleRowClick,
		handleListScroll,
	};
}
