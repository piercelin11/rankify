import ArtistAddingModal from "@/components/admin/ArtistAddingModal";
import { db } from "@/lib/prisma";
import GalleryWrapper from "@/components/display/showcase/GalleryWrapper";
import GalleryItem from "@/components/display/showcase/GalleryItem";
import { AddArtistButton } from "@/components/admin/AddNewButton";

export default async function AdminArtistsPage() {
	const artists = await db.artist.findMany();

	return (
		<div className="p-8">
			<div className="mb-8">
				<AddArtistButton />
			</div>

			<GalleryWrapper>
				{artists.map((artist) => (
					<GalleryItem
						key={artist.id}
						href={`/admin/artist/${artist.id}`}
						img={artist.img}
						title={artist.name}
						subTitle="Artist"
					/>
				))}
			</GalleryWrapper>
		</div>
	);
}
