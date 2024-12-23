import { notFound } from "next/navigation";
import React from "react";
import InfoHeader from "@/components/display/InfoHeader";
import getAlbumById from "@/lib/data/getAlbumById";
import getTracksByAlbum from "@/lib/data/getTracksByAlbum";
import { dateToLong } from "@/lib/utils/helper";
import TrackListItem from "@/components/admin/TrackListItem";
import getAlbumsByArtist from "@/lib/data/getAlbumsByArtist";
import AlbumActionIcons from "@/components/admin/AlbumActionIcons";

export default async function AdminAlbumPage({
	params,
}: {
	params: Promise<{ albumId: string }>;
}) {
	const { albumId } = await params;

	const album = await getAlbumById(albumId);
	const tracks = await getTracksByAlbum(albumId);

	if (!album) notFound();

	const albums = await getAlbumsByArtist(album.artistId);

	return (
		<>
			<InfoHeader data={album} subTitle={`${dateToLong(album.releaseDate)}`} />
			<div className="p-14">
				<div className="mb-12">
					<AlbumActionIcons data={album} />
				</div>
				{tracks.map((track) => (
					<TrackListItem
						key={track.id}
						trackData={track}
						savedAlbums={albums}
					/>
				))}
			</div>
		</>
	);
}
