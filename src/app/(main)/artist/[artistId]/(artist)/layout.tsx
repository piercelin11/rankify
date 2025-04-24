import ContentHeader from "@/components/presentation/ContentHeader";
import ContentWrapper from "@/components/layout/ContentWrapper";
import getArtistById from "@/lib/database/data/getArtistById";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";
import Tabs from "@/components/navigation/Tabs";
import { headers } from "next/headers";
import { getArtistTabOptions } from "@/config/menuData";
import BlurredImageBackground from "@/components/backgrounds/BlurredImageBackground";

type LayoutProps = {
	params: Promise<{ artistId: string }>;
	children: ReactNode;
};

export default async function MainLayout({ params, children }: LayoutProps) {
	return (
		<>
			<Suspense fallback={<ContentHeader />}>
				<Header params={params} />
			</Suspense>
			<ContentWrapper className="space-y-10">{children}</ContentWrapper>
		</>
	);
}

async function Header({ params }: { params: Promise<{ artistId: string }> }) {
	const artistId = (await params).artistId;
	const artist = await getArtistById(artistId);
	const tabOptions = getArtistTabOptions(artistId);

	const headerList = headers();
	const pathname = (await headerList).get("x-current-path");
	const activePathname = pathname?.split("/")[3];

	const isRankingPage = pathname?.includes("ranking");

	if (!artist) notFound();

	return (
		<>
			<ContentHeader
				data={artist}
				subTitleContent={
					<p className="text-description">
						{artist.spotifyFollowers} followers
					</p>
				}
				rounded
				type="Artist"
			>
				<div className="flex">
					<div className="ml-auto">
						<Tabs activeId={activePathname} options={tabOptions} />
					</div>
				</div>
			</ContentHeader>
			<BlurredImageBackground src={artist.img || ""} />
		</>
	);
}
