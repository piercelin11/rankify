import { db } from "@/db/client";
import { AddArtistButton } from "@/features/admin/addContent/components/AddAristButton";
import GalleryWrapper from "@/components/presentation/GalleryWrapper";
import GalleryItem from "@/components/presentation/GalleryItem";


export default async function AdminArtistsPage() {
	const artists = await db.artist.findMany();

	return (
		<div className="p-8 space-y-6">
			<div className="flex justify-between items-center">
				<div className="space-y-2">
                <h1 className="text-3xl font-bold">Artist Management</h1>
                <p className="text-muted-foreground">
                    Manage all artists and their information
                </p>
            </div>
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
