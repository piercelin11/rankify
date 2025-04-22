import getArtistById from "@/lib/database/data/getArtistById";
import { notFound } from "next/navigation";
import React from "react";
import getAlbumsByArtist from "@/lib/database/data/getAlbumsByArtist";
import getSinglesByArtist from "@/lib/database/data/getSinglesByArtist";
import TrackListItem from "@/features/admin/editContent/components/TrackListItem";
import ContentWrapper from "@/components/layout/ContentWrapper";
import AddAlbumButton from "@/features/admin/addContent/components/AddAlbumButton";
import AddEPButton from "@/features/admin/addContent/components/AddEPButton";
import AddSingleButton from "@/features/admin/addContent/components/AddSingleButton";
import ArtistActionSection from "@/features/admin/editContent/components/ArtistActionSection";
import ContentHeader from "@/components/presentation/ContentHeader";
import GalleryWrapper from "@/components/presentation/GalleryWrapper";
import GalleryItem from "@/components/presentation/GalleryItem";

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
			<ContentHeader
				data={artist}
				subTitleContent={<p>`${artist.spotifyFollowers} followers`</p>}
				rounded
			/>
			<ContentWrapper>
				<div className="mb-60 space-y-10">
					<ArtistActionSection data={artist} />
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
							<AddAlbumButton artistId={artistId} />
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
							<AddEPButton artistId={artistId} />
						</GalleryWrapper>
					</div>

					<div>
						<div className="mb-8 flex items-center justify-between">
							<h2>Singles</h2>
							<AddSingleButton artistId={artistId} />
						</div>
						{singles.map((single, index) => (
							<TrackListItem
								key={single.id}
								trackData={single}
								number={index + 1}
								albums={allAlbums}
							/>
						))}
					</div>
				</div>
			</ContentWrapper>
		</>
	);
}
