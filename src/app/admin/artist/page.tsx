import ArtistAddingModal from "@/components/admin/add-artist/ArtistaAddingModal";
import ModalOpenButton from "@/components/modal/ModalOpenButton";
import { PlusIcon } from "@radix-ui/react-icons";
import { prisma } from "@/lib/prisma";
import GalleryWrapper from "@/components/display/GalleryWrapper";
import GalleryItem from "@/components/display/GalleryItem";

export default async function AdminArtistsPage() {
	const artists = await prisma.artist.findMany();

	return (
		<div className="space-y-8 p-8">
			<ModalOpenButton variant="gray">
				<ArtistAddingModal />
				<div className="flex items-center justify-center gap-2 pr-2">
					<PlusIcon />
					Add Artist
				</div>
			</ModalOpenButton>
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
