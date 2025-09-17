"use client";

import { useCallback, useEffect, useState } from "react";
import { useThrottle } from "@/lib/hooks/useDebounceAndThrottle";

type MediaQueryType = "min" | "max";

export default function useMediaQuery(
	queryType: MediaQueryType,
	breackpoint: number
) {
	const [result, setResult] = useState<boolean>(false);

    const checkWidth =  useCallback(() => {
        const currentWidth = window.innerWidth;

        if (queryType === "min") {
            setResult(currentWidth >= breackpoint);
        } else {
            setResult(currentWidth <= breackpoint);
        }
    }, [queryType, breackpoint])

    const throttledCheckWidth = useThrottle(checkWidth, 200);

	useEffect(() => {
        checkWidth();
		window.addEventListener("resize", throttledCheckWidth);

		return () => window.removeEventListener("resize", throttledCheckWidth);
	}, [checkWidth, throttledCheckWidth]);

    return result;
}
