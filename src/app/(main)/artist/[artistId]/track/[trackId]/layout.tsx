import InfoHeader from "@/components/display/showcase/InfoHeader";
import ContentWrapper from "@/components/general/ContentWrapper";
import getTrackById from "@/lib/database/data/getTrackById";
import Link from "next/link";
import { notFound } from "next/navigation";

type AdminLayoutProps = {
	params: Promise<{ trackId: string; artistId: string }>;
	children: React.ReactNode;
};

export default async function TrackPageLayout({
	params,
	children,
}: AdminLayoutProps) {
	const trackId = (await params).trackId;
	const artistId = (await params).artistId;
	const trackData = await getTrackById(trackId);

	if (!trackData) notFound();

	return (
		<>
			<InfoHeader
				data={trackData}
				subTitle={
					trackData.album?.name ? (
						<Link href={`/artist/${artistId}/album/${trackData.albumId}`}>
							{trackData.album?.name}
						</Link>
					) : (
						"Non-album track"
					)
				}
				type="Track"
				color={trackData.album?.color}
			/>
			<ContentWrapper className="space-y-20">{children}</ContentWrapper>
		</>
	);
}
