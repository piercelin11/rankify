import { cn } from "@/lib/cn";
import React, { ReactNode } from "react";
import { RankingListItemProps } from "./RankingListItem";

type RankingListGridLayoutProps = {
	children: [ReactNode, ReactNode, ReactNode];
	length?: number;
	type?: "header" | "item";
};

export default function RankingListGridLayout({
	length = 1000,
	children,
	type = "item",
}: RankingListGridLayoutProps) {
	const numberWidth = length < 10 ? 25 : length < 100 ? 35 : 45;
	return (
		<div
			className={cn(
				"grid cursor-pointer select-none items-center gap-3 rounded border-b border-zinc-900 pl-2 pr-6 py-3",
				{
					"grid-cols-[45px,_3fr,_2fr]": numberWidth === 45,
					"grid-cols-[35px,_3fr,_2fr]": numberWidth === 35,
					"grid-cols-[25px,_3fr,_2fr]": numberWidth === 25,
					"mb-8": type === "header",
					"hover:bg-zinc-900": type !== "header",
				}
			)}
		>
			{children}
		</div>
	);
}
