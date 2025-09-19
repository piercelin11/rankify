
import Image from "next/image";

type BlurredImageBackgroundProps = {
	src: string;
	height?: string;
	priority?: boolean;
};

export default function BlurredImageBackground({
	src,
	height = "h-3/4",
	priority = false,
}: BlurredImageBackgroundProps) {
	return (
		<div className={`fixed left-0 top-0 -z-50 w-full overflow-hidden ${height}`}>
			<div className="absolute inset-0 -z-40 bg-gradient-dark" />
			<Image
				className="object-cover -z-50 blur-3xl"
				fill
				src={src}
				alt=""
				sizes="100vw"
				priority={priority}
			/>
		</div>
	);
}
