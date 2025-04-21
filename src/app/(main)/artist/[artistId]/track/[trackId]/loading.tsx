import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import React from "react";

export default function loading() {
	return (
		<div className="flex h-screen w-full items-center justify-center">
			<LoadingAnimation />
		</div>
	);
}
