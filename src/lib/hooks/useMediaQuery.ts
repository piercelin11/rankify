"use client";

import React, { useCallback, useEffect, useState } from "react";
import { throttle } from "../utils/helper";

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

	useEffect(() => {
        checkWidth();
        const throttleCheck = throttle(checkWidth, 200)
		window.addEventListener("resize", throttleCheck);

		return () => window.removeEventListener("resize", throttleCheck);
	}, [checkWidth]);

    return result;
}
