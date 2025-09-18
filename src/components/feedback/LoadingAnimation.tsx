
type LoadingAnimationProps = {
	size?: "small" | "base";
	isFull?: boolean;
};

export default function LoadingAnimation({
	size = "base",
	isFull = true
}: LoadingAnimationProps) {
	const styles =
		size === "small"
			? "border-2 border-t-2 w-4 h-4"
			: "border-4 border-t-4 w-8 h-8";

	return (
		<div
			className={` ${styles} ${isFull ? "mx-auto" : ""} animate-spin rounded-full border-t-neutral-800`}
		></div>
	);
}
