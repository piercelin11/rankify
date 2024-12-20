export default function LoadingAnimation({
	size = "base",
}: {
	size?: "small" | "base";
}) {
	const styles =
		size === "small"
			? "border-2 border-t-2 w-4 h-4"
			: "border-4 border-t-4 w-8 h-8";

	return (
		<div
			className={`border-zinc-500 ${styles} mx-auto animate-spin rounded-full border-t-zinc-800`}
		></div>
	);
}
