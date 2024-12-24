import getArtistById from "@/lib/data/getArtistById";
import { notFound } from "next/navigation";
import React from "react";
import GalleryWrapper from "@/components/display/GalleryWrapper";
import getAlbumsByArtist from "@/lib/data/getAlbumsByArtist";
import GalleryItem from "@/components/display/GalleryItem";
import InfoHeader from "@/components/display/InfoHeader";
import AddNewButton from "@/components/admin/AddNewButton";
import getSinglesByArtist from "@/lib/data/getSinglesByArtist";
import TrackListItem from "@/components/admin/TrackListItem";
import ArtistActionIcons from "@/components/admin/ArtistActionIcons";

export default async function AdminArtistPage({
	params,
}: {
	params: Promise<{ artistId: string }>;
}) {
	const { artistId } = await params;

	const artist = await getArtistById(artistId);
	const singles = (await getSinglesByArtist(artistId)).sort((a, b) => {
		if (a.releaseDate && b.releaseDate)
			return b.releaseDate.getTime() - a.releaseDate.getTime();
		else return 1;
	});
	const allAlbums = await getAlbumsByArtist(artistId);

	const albums = allAlbums.filter((album) => album.type === "ALBUM");
	const eps = allAlbums.filter((album) => album.type === "EP");

	if (!artist) notFound();

	return (
		<>
			<InfoHeader
				data={artist}
				subTitle={`${artist.spotifyFollowers} followers`}
				rounded
			/>
			<div className="mb-60 space-y-10 p-14">
				<ArtistActionIcons data={artist} />
				<div>
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
						<AddNewButton kind="default" artistId={artistId} type="Album" />
					</GalleryWrapper>
				</div>
				<div>
					<h2>EPs</h2>
					<GalleryWrapper>
						{eps.map((ep) => (
							<GalleryItem
								key={ep.id}
								href={`/admin/album/${ep.id}`}
								img={ep.img}
								title={ep.name}
								subTitle="EP"
							/>
						))}
						<AddNewButton kind="default" artistId={artistId} type="EP" />
					</GalleryWrapper>
				</div>

				<div>
					<div className="mb-8 flex items-center justify-between">
						<h2>Singles</h2>
						<AddNewButton
							kind="default"
							artistId={artistId}
							type="Single"
							buttonLabel="Add Singles"
						/>
					</div>
					{singles.map((single, index) => (
						<TrackListItem
							key={single.id}
							trackData={single}
							number={index + 1}
							savedAlbums={allAlbums}
						/>
					))}
				</div>
			</div>
		</>
	);
}
