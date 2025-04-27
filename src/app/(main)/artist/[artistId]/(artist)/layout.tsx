import ContentHeader from "@/components/presentation/ContentHeader";
import ContentWrapper from "@/components/layout/ContentWrapper";
import getArtistById from "@/lib/database/data/getArtistById";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";
import BlurredImageBackground from "@/components/backgrounds/BlurredImageBackground";
import ArtistHeaderTab from "@/components/navigation/ArtistHeaderTab";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";

type LayoutProps = {
	params: Promise<{ artistId: string }>;
	children: ReactNode;
};

export default async function MainLayout({ params, children }: LayoutProps) {
	return (
		<>
			<Header params={params} />
			<Suspense fallback={<LoadingAnimation />}>
				<ContentWrapper className="space-y-10">{children}</ContentWrapper>
			</Suspense>
		</>
	);
}

async function Header({ params }: { params: Promise<{ artistId: string }> }) {
	const artistId = (await params).artistId;
	const artist = await getArtistById(artistId);

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
				<ArtistHeaderTab artistId={artistId} />
			</ContentHeader>
			<BlurredImageBackground src={artist.img || ""} />
		</>
	);
}
