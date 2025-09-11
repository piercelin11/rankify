import { notFound } from "next/navigation";
import React from "react";

import getAlbumById from "@/lib/database/data/getAlbumById";
import getTracksByAlbum from "@/lib/database/data/getTracksByAlbum";
import { dateToLong } from "@/lib/utils";
import TracksTable from "@/features/admin/editContent/components/TracksTable";
import getAlbumsByArtist from "@/lib/database/data/getAlbumsByArtist";
import ContentWrapper from "@/components/layout/ContentWrapper";
import AlbumActionSection from "@/features/admin/editContent/components/AlbumActionSection";
import AdminContentHeader from "@/features/admin/editContent/components/AdminContentHeader";

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
			<AdminContentHeader
				data={album}
				subTitleContent={<p>{dateToLong(album.releaseDate)}</p>}
			>
				<AlbumActionSection data={album} />
			</AdminContentHeader>
			<ContentWrapper>
				<TracksTable tracks={tracks} albums={albums} />
			</ContentWrapper>
		</>
	);
}
