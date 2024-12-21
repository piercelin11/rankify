import getArtistById from "@/lib/data/getArtistById";
import { notFound } from "next/navigation";
import React from "react";
import GalleryWrapper from "@/components/display/GalleryWrapper";
import getAlbumByArtist from "@/lib/data/getAlbumByArtist";
import GalleryItem from "@/components/display/GalleryItem";
import InfoHeader from "@/components/display/InfoHeader";

export default async function AdminArtistPage({
	params,
}: {
	params: Promise<{ artistId: string }>;
}) {
	const { artistId } = await params;

	const artist = await getArtistById(artistId);
	const albums = await getAlbumByArtist(artistId);

	if (!artist) notFound();

	return (
		<>
			<InfoHeader data={artist} subTitle={`${artist.spotifyFollowers} followers`} rounded />
			<div className="p-14">
				<h2>Albums</h2>
				<GalleryWrapper>
					{albums.map((album) => (
						<GalleryItem
							key={album.id}
							href={`/admin/album/${album.id}`}
							img={album.img}
							title={album.name}
							subTitle="Album"
						/>
					))}
				</GalleryWrapper>
			</div>
		</>
	);
}
