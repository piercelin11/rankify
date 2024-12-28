import { ArrowLeftIcon, ArrowTopRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

type NavButtonProps = {
	type: "forward" | "backward";
	label: string;
	link: string;
};

export default function RankingNavButton({
	type,
	label,
	link,
}: NavButtonProps) {
	return (
		<div className="flex w-full justify-center">
			<Link
				className="flex gap-2 text-zinc-500 hover:text-zinc-100"
				href={link}
			>
				{type === "forward" ? (
					<>
						{label}
						<ArrowTopRightIcon className="self-center" />
					</>
				) : (
					<>
						<ArrowLeftIcon className="self-center" />
						{label}
					</>
				)}
			</Link>
		</div>
	);
}
