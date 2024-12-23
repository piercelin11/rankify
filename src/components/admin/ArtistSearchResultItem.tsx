import React from "react";
import { Artist } from "spotify-api.js";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/cn";

type ArtistSearchResultItemProps = {
	data: Omit<Artist, "externalURL" | "makeCodeImage">;
} & React.HTMLAttributes<HTMLDivElement>;

export default function ArtistSearchResultItem({
	data,
	className,
	...props
}: ArtistSearchResultItemProps) {
	return (
		<div
			className={cn(
				"grid cursor-pointer select-none grid-cols-[50px,_1fr,_100px] items-center gap-2 rounded px-3 py-2 hover:bg-zinc-800",
				className
			)}
			{...props}
		>
			<img
				className="rounded-full"
				src={data.images?.[2]?.url || "/pic/placeholder.jpg"}
				alt={data.name}
				width={45}
				height={45}
			/>
			<div>
				<p>{data.name}</p>
				<p className="text-sm text-zinc-400">Artist</p>
			</div>
			<ChevronRightIcon
				className="justify-self-end text-zinc-500"
				width={20}
				height={20}
			/>
		</div>
	);
}
