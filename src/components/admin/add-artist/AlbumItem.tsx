import React from "react";
import { Album } from "spotify-types";
import CheckBox from "@/components/ui/CheckBox";

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
				className="rounded"
				src={data.images[2]?.url}
				alt={data.name}
				width={45}
				height={45}
			/>
			<div>
				<p>{data.name}</p>
				<p className="text-sm text-zinc-400">Album</p>
			</div>
			<CheckBox
				onClick={() => handleClick(data.id)}
				className="justify-self-end"
				checked={checked}
			/>
		</div>
	);
}
