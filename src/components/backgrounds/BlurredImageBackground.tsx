import React from "react";
import Image from "next/image";

type BlurredImageBackgroundProps = {
	src: string;
};

export default function BlurredImageBackground({
	src,
}: BlurredImageBackgroundProps) {
	return (
		<>
			<div className="fixed top-0 -z-10 h-[600px] w-full bg-gradient-dark xl:h-[840px]" />
			<div className="fixed top-0 -z-20 h-[600px] w-full overflow-hidden xl:h-[840px]">
				<Image
					className="object-cover opacity-90 blur-3xl"
					fill
					src={src}
					alt="background picture"
					sizes="(min-width: 768px) 50px, 20px"
				/>
			</div>
		</>
	);
}
