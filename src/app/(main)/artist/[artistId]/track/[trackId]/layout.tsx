import ContentHeader from "@/components/presentation/ContentHeader";
import ContentWrapper from "@/components/layout/ContentWrapper";
import getTrackById from "@/lib/database/data/getTrackById";
import { notFound } from "next/navigation";
import BlurredImageBackground from "@/components/backgrounds/BlurredImageBackground";
import Scroll from "@/components/layout/Scroll";
import TrackPageSubtitleContent from "../_components/TrackPageSubtitleContent";

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
			<Scroll />
			<Header params={params} />
			<ContentWrapper className="space-y-10 2xl:space-y-20">
				{children}
			</ContentWrapper>
		</>
	);
}

async function Header({ params }: Omit<LayoutProps, "children">) {
	const trackId = (await params).trackId;
	const trackData = await getTrackById(trackId);

	if (!trackData) notFound();

	return (
		<>
			<ContentHeader
				data={trackData}
				subTitleContent={
					<TrackPageSubtitleContent key={trackData.id} trackData={trackData} />
				}
				type="Track"
				color={trackData.album?.color}
			/>
			<BlurredImageBackground src={trackData.img ?? ""} />
		</>
	);
}
