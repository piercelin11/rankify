import { notFound } from "next/navigation";
import { ReactNode } from "react";
import BlurredImageBackground from "@/components/backgrounds/BlurredImageBackground";
import ContentHeader from "@/components/presentation/ContentHeader";
import { getArtistById } from "@/db/artist";
import { PageContainer } from "@/components/layout/PageContainer";
import ArtistNavigationHeader from "@/components/layout/ArtistNavigationHeader";

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
			<ArtistNavigationHeader artist={artist} />
			<ContentHeader
				data={artist}
				subTitleContent={<p>{artist.spotifyFollowers} followers</p>}
				rounded
				type="Artist"
			/>
			<BlurredImageBackground src={artist.img || ""} />
			<PageContainer>{children}</PageContainer>
		</>
	);
}
