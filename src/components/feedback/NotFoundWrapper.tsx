import Button from "@/components/buttons/Button";
import Link from "next/link";

type NotFoundProps = {
	title: string;
	descrpiption: string;
	redirectUrl?: string;
	buttonLabel?: string;
};

export default function NotFoundWrapper({
	title,
	descrpiption,
	redirectUrl = "/",
	buttonLabel = "Return Home",
}: NotFoundProps) {
	return (
		<div className="flex h-screen w-full items-center justify-center">
			<div className="relative flex flex-col items-center gap-3">
				<p className="text-8xl font-black text-neutral-800/40">404</p>
				<h2>{title}</h2>
				<p>{descrpiption}</p>
				<Link href={redirectUrl} className="my-3">
					<Button variant="secondary">{buttonLabel}</Button>
				</Link>
			</div>
		</div>
	);
}
