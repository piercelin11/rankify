import { cn } from "@/lib/cn";

type LoadingAnimationProps = {
	size?: "small" | "base";
};

export default function LoadingAnimation({
	size = "base",
}: LoadingAnimationProps) {
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
