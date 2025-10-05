import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4">
			<h2 className="text-2xl font-bold">找不到頁面</h2>
			<Link
				href="/"
				className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
			>
				返回首頁
			</Link>
		</div>
	);
}
