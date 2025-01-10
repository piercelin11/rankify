import InfoHeader from "@/components/display/showcase/InfoHeader";
import ContentWrapper from "@/components/general/ContentWrapper";
import getAlbumById from "@/lib/database/data/getAlbumById";
import getTrackById from "@/lib/database/data/getTrackById";
import { notFound } from "next/navigation";

type AdminLayoutProps = {
	params: Promise<{ albumId: string }>;
	children: React.ReactNode;
};

export default async function TrackPageLayout({
	params,
	children,
}: AdminLayoutProps) {
	const albumId = (await params).albumId;
	const albumData = await getAlbumById(albumId);

	if (!albumData) notFound();

	return (
		<>
			<InfoHeader
				data={albumData}
				subTitle={albumData.artist.name}
				type="Album"
				color={albumData.color}
			/>
			<ContentWrapper className="space-y-20">{children}</ContentWrapper>
		</>
	);
}
