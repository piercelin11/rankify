import React from "react";
import { Album, SimplifiedAlbum, Track } from "spotify-types";
import CheckBox from "@/components/ui/CheckBox";

type SelectablecContentItemProps = {
	data: Album | SimplifiedAlbum | Track;
	handleClick: (albumId: string) => void;
	checked: boolean;
	type: string;
};

export default function SelectablecContentItem({
	data,
	handleClick,
	checked,
	type,
}: SelectablecContentItemProps) {
	function isAlbum(
		data: Album | SimplifiedAlbum | Track
	): data is Album | SimplifiedAlbum {
		return "images" in data;
	}

	return (
		<div
			className="flex select-none items-center gap-2 rounded sm:px-3 py-2 hover:bg-zinc-800"
			onClick={() => handleClick(data.id)}
		>
			<img
				className="rounded"
				src={isAlbum(data) ? data.images[2]?.url : data.album.images[2]?.url}
				alt={data.name}
				width={45}
				height={45}
			/>
			<div className="overflow-hidden">
				<p className="text-nowrap overflow-hidden text-ellipsis">{data.name}</p>
				<p className="text-sm text-zinc-400">{type}</p>
			</div>
			<CheckBox
				className="ml-auto"
				checked={checked}
			/>
		</div>
	);
}
