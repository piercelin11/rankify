import { notFound } from "next/navigation";
import React from "react";
import InfoHeader from "@/components/display/showcase/InfoHeader";
import getAlbumById from "@/lib/database/data/getAlbumById";
import getTracksByAlbum from "@/lib/database/data/getTracksByAlbum";
import { dateToLong } from "@/lib/utils/helper";
import TrackListItem from "@/features/admin/editContent/components/TrackListItem";
import getAlbumsByArtist from "@/lib/database/data/getAlbumsByArtist";
import ContentWrapper from "@/components/general/ContentWrapper";
import AlbumActionSection from "@/features/admin/editContent/components/AlbumActionSection";

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
			<ContentWrapper>
				<div className="mb-12">
					<AlbumActionSection data={album} />
				</div>
				{tracks.map((track) => (
					<TrackListItem
						key={track.id}
						trackData={track}
						albums={albums}
					/>
				))}
			</ContentWrapper>
		</>
	);
}
