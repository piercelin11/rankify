import React from "react";
import { Artist } from "spotify-api.js";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_PIC } from "@/constants";

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
				"flex cursor-pointer select-none items-center gap-2 rounded py-2 hover:bg-neutral-800 sm:px-3",
				className
			)}
			{...props}
		>
			<img
				className="rounded-full"
				src={data.images?.[2]?.url || PLACEHOLDER_PIC}
				alt={data.name}
				width={45}
				height={45}
			/>
			<div className="overflow-hidden">
				<p className="overflow-hidden text-ellipsis text-nowrap">{data.name}</p>
				<p className="text-sm text-neutral-400">Artist</p>
			</div>
			<ChevronRightIcon
				className="ml-auto justify-self-end text-neutral-500"
				width={20}
				height={20}
			/>
		</div>
	);
}
