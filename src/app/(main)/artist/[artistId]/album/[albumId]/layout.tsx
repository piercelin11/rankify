import { notFound } from "next/navigation";
import { ReactNode } from "react";
import BlurredImageBackground from "@/components/backgrounds/BlurredImageBackground";
import ContentHeader from "@/components/presentation/ContentHeader";
import SimpleBreadcrumb, {
	createBreadcrumbItems,
} from "@/components/navigation/SimpleBreadcrumb";
import { ArtistData } from "@/types/data";
import Image from "next/image";
import Link from "next/link";
import { Album } from "@prisma/client";
import { getAlbumForAlbumPage } from "@/db/album";

type LayoutProps = {
	params: Promise<{ albumId: string }>;
	children: ReactNode;
};

export default async function MainLayout({ params, children }: LayoutProps) {
	const albumId = (await params).albumId;
	const album = await getAlbumForAlbumPage({ albumId });

	if (!album) notFound();

	return (
		<>
			<SubHeader album={album} />
			<ContentHeader
				data={album}
				subTitleContent={
					<>
						<div className="flex items-center gap-1">
							<Image
								className="rounded-full"
								width={30}
								height={30}
								src={album.artist.img ?? ""}
								alt={album.artist.name}
								priority
							/>
							<Link
								className="font-semibold hover:text-foreground hover:underline"
								href={`/artist/${album.artist.id}`}
							>
								{album.artist.name}
							</Link>
						</div>
					</>
				}
				type="Artist"
			/>
			<BlurredImageBackground src={album.img || ""} />
			<div className="p-content">{children}</div>
		</>
	);
}

async function SubHeader({ album }: { album: Album & { artist: ArtistData } }) {
	const breadCrumbItems = createBreadcrumbItems([
		{
			label: "Home",
			href: "/",
		},
		{
			label: album.artist.name,
			href: `/artist/${album.artist.id}`,
		},
		{
			label: album.name,
		},
	]);

	return (
		<div className="space-y-4 px-content pt-content md:flex md:justify-between">
			<SimpleBreadcrumb items={breadCrumbItems} />
		</div>
	);
}
