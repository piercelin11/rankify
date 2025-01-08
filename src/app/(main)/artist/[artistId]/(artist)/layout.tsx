import InfoHeader from "@/components/display/showcase/InfoHeader";
import ContentWrapper from "@/components/general/ContentWrapper";
import getArtistById from "@/lib/database/data/getArtistById";
import { notFound } from "next/navigation";

type AdminLayoutProps = {
	params: Promise<{ artistId: string }>;
	children: React.ReactNode;
};

export default async function MainLayout({ params, children }: AdminLayoutProps) {
	const artistId = (await params).artistId;
	const artist = await getArtistById(artistId)

	if (!artist) notFound();

	return (
		<>
			<InfoHeader
				data={artist}
				subTitle={`${artist.spotifyFollowers} followers`}
				rounded
				type="Artist"
			/>
			<ContentWrapper className="space-y-10">{children}</ContentWrapper>
		</>
	);
}
