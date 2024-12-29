import InfoHeader from "@/components/display/showcase/InfoHeader";
import ContentWrapper from "@/components/general/ContentWrapper";
import getArtistById from "@/lib/data/getArtistById";
import getTrackById from "@/lib/data/getTrackById";
import { notFound } from "next/navigation";

type AdminLayoutProps = {
	params: Promise<{ trackId: string }>;
	children: React.ReactNode;
};

export default async function TrackPageLayout({
	params,
	children,
}: AdminLayoutProps) {
	const trackId = (await params).trackId;
	const trackData = await getTrackById(trackId);

	if (!trackData) notFound();

	return (
		<>
			<InfoHeader
				data={trackData}
				subTitle={trackData.artist.name}
				type="Track"
			/>
			<ContentWrapper className="space-y-20">{children}</ContentWrapper>
		</>
	);
}
