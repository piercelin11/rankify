import { notFound } from "next/navigation";
import { ReactNode } from "react";
import BlurredImageBackground from "@/components/backgrounds/BlurredImageBackground";
import ContentHeader from "@/components/presentation/ContentHeader";
import { parsePathnameFromHeaders } from "@/lib/utils";
import { headers } from "next/headers";
import SegmentControl from "@/components/navigation/SegmentControl";
import SimpleBreadcrumb, {
	createBreadcrumbItems,
} from "@/components/navigation/SimpleBreadcrumb";
import { ArtistData } from "@/types/data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getArtistTabOptions } from "@/config/artistTabs";
import getArtistById from "@/db/artsit";

type LayoutProps = {
	params: Promise<{ artistId: string }>;
	children: ReactNode;
};

export default async function MainLayout({ params, children }: LayoutProps) {
	const artistId = (await params).artistId;
	const artist = await getArtistById(artistId);

	if (!artist) notFound();
	return (
		<>
			<SubHeader artist={artist} />
			<ContentHeader
				data={artist}
				subTitleContent={
					<p className="text-description text-neutral-300/40">
						{artist.spotifyFollowers} followers
					</p>
				}
				rounded
				type="Artist"
			/>
			<BlurredImageBackground src={artist.img || ""} />
			<div className="p-content">{children}</div>
		</>
	);
}

async function SubHeader({ artist }: { artist: ArtistData }) {
	const tabOptions = getArtistTabOptions(artist.id);
	const headersList = await headers();
	const parsedPathname = parsePathnameFromHeaders(headersList);
	const breadCrumbItems = createBreadcrumbItems([
		{
			label: "Home",
			href: "/",
		},
		{
			label: artist.name,
		},
	]);

	const isRakingPage = parsedPathname?.segments.includes("ranking");

	return (
		<div className="space-y-4 px-content pt-content md:flex md:justify-between">
			<SimpleBreadcrumb items={breadCrumbItems} />
			<div className="flex gap-4">
				{!isRakingPage && (
					<SegmentControl
						variant="animated"
						size="lg"
						options={tabOptions.map((option) => ({
							...option,
							value: option.id,
						}))}
						value={parsedPathname?.segments[2]}
					/>
				)}
				{isRakingPage ? (
					<Button className="h-12">
						<Plus className="h-8 w-8 text-neutral-900" />
						Create Sorter
					</Button>
				) : (
					<Button size="icon" className="h-12 w-12 rounded-full">
						<Plus className="h-8 w-8 text-neutral-900" />
					</Button>
				)}
			</div>
		</div>
	);
}
