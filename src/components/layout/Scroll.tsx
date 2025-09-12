"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Scroll() {
	const pathname = usePathname();
	useEffect(() => {
		const mainContent = document.querySelector(".main-content");
		mainContent?.scrollTo({ top: 0, behavior: "instant" });
		window.scroll(0, 0);
	}, [pathname]);

	return <></>;
}
