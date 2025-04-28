import ContentWrapper from "@/components/layout/ContentWrapper";
import getArtistById from "@/lib/database/data/getArtistById";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";
import BlurredImageBackground from "@/components/backgrounds/BlurredImageBackground";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import ArtistHeader from "@/components/navigation/ArtistHeader";

type LayoutProps = {
	params: Promise<{ artistId: string }>;
	children: ReactNode;
};

export default async function MainLayout({ params, children }: LayoutProps) {
	return (
		<>
			<Header params={params} />
			<Suspense fallback={<LoadingAnimation />}>
				<ContentWrapper className="space-y-5 flex-1">{children}</ContentWrapper>
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
			<ArtistHeader artistData={artist} />
			<BlurredImageBackground src={artist.img || ""} />
		</>
	);
}
