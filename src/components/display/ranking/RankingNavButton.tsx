import Link from "next/link";
import React, { ReactNode } from "react";

type NavButtonProps = {
	children: [ReactNode, ReactNode];
	link: string;
};

export default function RankingNavButton({
	children,
	link,
}: NavButtonProps) {
	return (
		<div className="flex w-full justify-center [&_svg]:self-center">
			<Link
				className="flex gap-2 text-zinc-500 hover:text-zinc-100"
				href={link}
			>
				{children[0]}
				{children[1]}
			</Link>
		</div>
	);
}
