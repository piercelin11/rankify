"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FixedSizeList, ListOnScrollProps } from 'react-window';

type UseListScrollProps = {
    sessionKey: string
}

export default function useListScroll({sessionKey}: UseListScrollProps) {

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
        const savedOffset = sessionStorage.getItem(sessionKey);
        if (savedOffset !== null && listInstance) {
            const offset = parseInt(savedOffset, 10);
            if (!isNaN(offset)) {
                listInstance.scrollTo(offset);
            }
            sessionStorage.removeItem(sessionKey);
        }
    }, [listInstance]);

    const handleRowClick = useCallback(() => {
        const currentOffset = currentScrollOffsetRef.current;
        if (currentOffset > 0) {
            sessionStorage.setItem(sessionKey, String(currentOffset));
        } else {
            sessionStorage.removeItem(sessionKey);
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
        handleListScroll
    }
}
