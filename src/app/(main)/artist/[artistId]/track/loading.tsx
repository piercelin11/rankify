import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import ContentHeader from "@/components/presentation/ContentHeader";
import React from "react";

export default function loading() {
	return (
		<div className="flex h-screen w-full flex-col">
			<ContentHeader />
			<div className="flex flex-grow items-center justify-center">
				<LoadingAnimation />
			</div>
		</div>
	);
}
