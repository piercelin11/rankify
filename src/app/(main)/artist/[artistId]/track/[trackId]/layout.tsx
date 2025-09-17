import { notFound } from "next/navigation";
import { ReactNode } from "react";
import BlurredImageBackground from "@/components/backgrounds/BlurredImageBackground";
import ContentHeader from "@/components/presentation/ContentHeader";
import SimpleBreadcrumb, {
	createBreadcrumbItems,
} from "@/components/navigation/SimpleBreadcrumb";
import { ArtistData } from "@/types/data";
import { getTrackForTrackPage } from "@/db/track";
import Image from "next/image";
import Link from "next/link";
import { Track } from "@prisma/client";

type LayoutProps = {
	params: Promise<{ trackId: string }>;
	children: ReactNode;
};

export default async function MainLayout({ params, children }: LayoutProps) {
	const trackId = (await params).trackId;
	const track = await getTrackForTrackPage(trackId);

	if (!track) notFound();
	return (
		<>
			<SubHeader track={track} />
			<ContentHeader
				data={track}
				subTitleContent={
					<>
						<div className="flex items-center gap-1">
							<Image
								className="rounded-full"
								width={30}
								height={30}
								priority
								src={track.artist.img ?? ""}
								alt={track.artist.name}
							/>
							<Link
								className="font-semibold hover:text-neutral-100 hover:underline"
								href={`/artist/${track.artist.id}`}
								//onClick={handleClick}
							>
								{track.artist.name}
							</Link>
						</div>
						{track.album && (
							<>
								•
								<Link
									className="hover:text-neutral-100 hover:underline"
									href={`/artist/${track.artist.id}/album/${track.albumId}`}
									//onClick={handleClick}
								>
									{track.album.name}
								</Link>
							</>
						)}
					</>
				}
				type="Artist"
			/>
			<BlurredImageBackground src={track.img || ""} />
			<div className="p-content">{children}</div>
		</>
	);
}

async function SubHeader({ track }: { track: Track & { artist: ArtistData } }) {
	const breadCrumbItems = createBreadcrumbItems([
		{
			label: "Home",
			href: "/",
		},
		{
			label: track.artist.name,
			href: `/artist/${track.artist.id}/overview`,
		},
		{
			label: track.name,
		},
	]);

	return (
		<div className="space-y-4 px-content pt-content md:flex md:justify-between">
			<SimpleBreadcrumb items={breadCrumbItems} />
		</div>
	);
}
