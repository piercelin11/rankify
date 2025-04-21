import ContentHeader from "@/components/presentation/ContentHeader";
import ContentWrapper from "@/components/layout/ContentWrapper";
import getTrackById from "@/lib/database/data/getTrackById";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type LayoutProps = {
	params: Promise<{ trackId: string; artistId: string }>;
	children: React.ReactNode;
};

export default async function TrackPageLayout({
	params,
	children,
}: LayoutProps) {
	return (
		<>
			<Suspense fallback={<ContentHeader />}>
				<Header params={params} />
			</Suspense>
			<ContentWrapper className="space-y-10 2xl:space-y-20">{children}</ContentWrapper>
		</>
	);
}

async function Header({ params }: Omit<LayoutProps, "children">) {
	const trackId = (await params).trackId;
	const artistId = (await params).artistId;
	const trackData = await getTrackById(trackId);

	if (!trackData) notFound();

	return (
		<ContentHeader
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
	);
}
