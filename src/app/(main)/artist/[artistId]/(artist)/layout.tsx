import getArtistById from "@/lib/database/data/getArtistById";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import BlurredImageBackground from "@/components/backgrounds/BlurredImageBackground";
import ContentHeader from "@/components/presentation/ContentHeader";
import { parsePathnameFromHeaders } from "@/lib/utils";
import { headers } from "next/headers";
import SegmentControl from "@/components/navigation/SegmentControl";
import { getArtistTabOptions } from "@/config/navData";
import SimpleBreadcrumb, {
	createBreadcrumbItems,
} from "@/components/navigation/SimpleBreadcrumb";
import { ArtistData } from "@/types/data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

	return (
		<div className="px-content pt-content space-y-4 md:flex md:justify-between">
			<SimpleBreadcrumb items={breadCrumbItems} />
			<div className="flex gap-4">
				<SegmentControl
					variant="animated"
					size="lg"
					options={tabOptions.map(option => ({
						...option,
						value: option.id // 轉換 id 為 value
					}))}
					value={parsedPathname?.segments[2]}
				/>
				<Button size="icon" className="h-12 w-12 rounded-full">
					<Plus className="text-neutral-900 h-8 w-8" />
				</Button>
			</div>
		</div>
	);
}
