import { db } from "@/lib/prisma";
import { AddArtistButton } from "@/features/admin/addContent/components/AddAristButton";
import GalleryWrapper from "@/components/presentation/GalleryWrapper";
import GalleryItem from "@/components/presentation/GalleryItem";


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
