import React from "react";
import { Album, SimplifiedAlbum, Track } from "spotify-types";
import CheckBox from "@/components/ui/CheckBox";

type SelectableItemProps = {
	data: Album | SimplifiedAlbum | Track;
	handleClick: (albumId: string) => void;
	checked: boolean;
	type: string;
};

export default function SelectableItem({
	data,
	handleClick,
	checked,
	type,
}: SelectableItemProps) {
	function isAlbum(
		data: Album | SimplifiedAlbum | Track
	): data is Album | SimplifiedAlbum {
		return "images" in data;
	}

	return (
		<div
			className="grid select-none grid-cols-[50px,_1fr,_100px] items-center gap-2 rounded px-3 py-2 hover:bg-zinc-800"
			onClick={() => handleClick(data.id)}
		>
			<img
				className="rounded"
				src={isAlbum(data) ? data.images[2]?.url : data.album.images[2]?.url}
				alt={data.name}
				width={45}
				height={45}
			/>
			<div>
				<p>{data.name}</p>
				<p className="text-sm text-zinc-400">{type}</p>
			</div>
			<CheckBox
				className="justify-self-end"
				checked={checked}
			/>
		</div>
	);
}
