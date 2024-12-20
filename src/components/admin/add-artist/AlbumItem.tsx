import React from "react";
import { Album } from "spotify-api.js";
import Button from "@/components/ui/Button";
import { CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/cn";

type AlbumItemProps = {
	data: Album;
	handleClick: (albumId: string) => void;
	checked: boolean;
};

export default function AlbumItem({
	data,
	handleClick,
	checked,
}: AlbumItemProps) {
	return (
		<div className="grid select-none grid-cols-[50px,_1fr,_100px] items-center gap-2 rounded px-3 py-2 hover:bg-zinc-800">
			<img
				className="rounded-full"
				src={data.images[2]?.url}
				alt={data.name}
				width={45}
				height={45}
			/>
			<div>
				<p>{data.name}</p>
				<p className="text-sm text-zinc-400">Album</p>
			</div>
			<div
				onClick={() => handleClick(data.id)}
				className={cn(
					"flex h-6 w-6 cursor-pointer items-center justify-center justify-self-end rounded border border-zinc-700 hover:border-zinc-400",
					{
						"border-zinc-400 bg-zinc-800": checked,
					}
				)}
			>
				{checked && <CheckIcon />}
			</div>
		</div>
	);
}
