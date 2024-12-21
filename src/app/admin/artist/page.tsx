import ArtistAddingModal from "@/components/admin/add-artist/ArtistaAddingModal";
import ModalOpenButton from "@/components/modal/ModalOpenButton";
import { PlusIcon } from "@radix-ui/react-icons";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import GalleryGridLayout from "@/components/latout/GalleryGridLayout";

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
			<GalleryGridLayout>
				{artists.map((artist) => (
					<Link key={artist.id} href={`/admin/artist/${artist.id}`}>
						<div className="rounded p-3 hover:bg-zinc-900">
							<img
								className="mb-4 rounded-full"
								src={artist.img ?? undefined}
								alt={artist.name}
							/>
							<p>{artist.name}</p>
							<p className="text-sm text-zinc-400">Artist</p>
						</div>
					</Link>
				))}
			</GalleryGridLayout>
		</div>
	);
}
