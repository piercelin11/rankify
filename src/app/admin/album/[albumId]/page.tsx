import { notFound } from "next/navigation";
import React from "react";
import HeaderInfoWrapper from "@/components/display/InfoHeader";
import getAlbumById from "@/lib/data/getAlbumById";
import getTracksByAlbum from "@/lib/data/getTracksByAlbum";
import { dateToLong } from "@/lib/helper";
import ListItem from "@/components/admin/ListItem";

export default async function AdminAlbumPage({
	params,
}: {
	params: Promise<{ albumId: string }>;
}) {
	const { albumId } = await params;

	const album = await getAlbumById(albumId);
	const tracks = await getTracksByAlbum(albumId);

	if (!album) notFound();

	return (
		<>
			<HeaderInfoWrapper data={album} subTitle={`${dateToLong(album.releaseDate)}`} />
            <div className="p-14">
				{tracks.map((track) => (
					<ListItem key={track.id} trackData={track} />
				))}
			</div>
		</>
	);
}
