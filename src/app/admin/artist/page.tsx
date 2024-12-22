import AddArtistaModal from "@/components/admin/AddArtistaModal";
import ModalOpenButton from "@/components/modal/ModalOpenButton";
import { PlusIcon } from "@radix-ui/react-icons";
import { prisma } from "@/lib/prisma";
import GalleryWrapper from "@/components/display/GalleryWrapper";
import GalleryItem from "@/components/display/GalleryItem";

export default async function AdminArtistsPage() {
	const artists = await prisma.artist.findMany();

	return (
		<div className="p-8">
			<div className="mb-8">
			<ModalOpenButton variant="gray">
				<AddArtistaModal />
				<div className="flex items-center justify-center gap-2 pr-2">
					<PlusIcon />
					Add Artist
				</div>
			</ModalOpenButton>
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
