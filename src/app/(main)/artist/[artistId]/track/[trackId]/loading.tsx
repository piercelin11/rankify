import LoadingAnimation from "@/components/ui/LoadingAnimation";
import React from "react";

export default function loading() {
	return (
		<div className="flex h-screen w-full items-center justify-center">
			<LoadingAnimation />
		</div>
	);
}
