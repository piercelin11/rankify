import InfoHeader from "@/components/display/showcase/InfoHeader";
import ContentWrapper from "@/components/general/ContentWrapper";
import getTrackById from "@/lib/database/data/getTrackById";
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
				color={trackData.album?.color}
			/>
			<ContentWrapper className="space-y-20">{children}</ContentWrapper>
		</>
	);
}
