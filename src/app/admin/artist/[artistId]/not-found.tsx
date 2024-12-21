import Button from "@/components/ui/Button";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex h-screen w-full items-center justify-center">
			<div className=" relative flex flex-col items-center gap-3">
                <p className="text-8xl font-black text-zinc-800/40">404</p>
				<h2>Artist Not Found</h2>
				<p>Could not find requested resource</p>
				<Link href="/" className="my-3">
					<Button variant="gray">Return Home</Button>
				</Link>
			</div>
		</div>
	);
}
