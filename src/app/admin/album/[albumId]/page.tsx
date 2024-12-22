import { notFound } from "next/navigation";
import React from "react";
import HeaderInfoWrapper from "@/components/display/InfoHeader";
import getAlbumById from "@/lib/data/getAlbumById";
import getTrackByAlbum from "@/lib/data/getTrackByAlbum";
import { dateToLong } from "@/lib/helper";

export default async function AdminAlbumPage({
	params,
}: {
	params: Promise<{ albumId: string }>;
}) {
	const { albumId } = await params;

	const album = await getAlbumById(albumId);
	const tracks = await getTrackByAlbum(albumId);

	if (!album) notFound();

	return (
		<>
			<HeaderInfoWrapper data={album} subTitle={`${dateToLong(album.releaseDate)}`} />
            <div className="p-14">
				{tracks.map((track) => (
					<div
						key={track.id}
						className="grid cursor-pointer select-none grid-cols-[30px,_65px,_1fr] items-center gap-3 rounded px-3 py-2 hover:bg-zinc-900"
					>
						<p className="font-serif justify-self-end text-lg font-medium text-zinc-500 mr-2">
							{track.trackNumber}
						</p>
						<img
							className="rounded"
							src={track.img || undefined}
							alt={track.name}
							width={65}
							height={65}
						/>
						<div>
							<p>{track.name}</p>
							<p className="text-sm text-zinc-400">{track.artist.name}</p>
						</div>
					</div>
				))}
			</div>
		</>
	);
}
