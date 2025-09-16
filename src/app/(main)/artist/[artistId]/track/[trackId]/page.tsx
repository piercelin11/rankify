import { getUserSession } from "@/../auth";
import SegmentControl from "@/components/navigation/SegmentControl";
import { Card } from "@/components/ui/card";
import { TRACK_SEGMENT_OPTIONS } from "@/config/segmentOptions";
import { getTrackRanking, getTrackComparisonOptions } from "@/db/track";
import RankingLineChart from "@/features/ranking/chart/RankingLineChart";
//import getTracksStats from "@/services/track/getTracksStats";
import { notFound } from "next/navigation";
import { getComparisonTracksData } from "./actions";

export default async function page({
	params,
}: {
	params: Promise<{ trackId: string; artistId: string }>;
}) {
	const trackId = (await params).trackId;
	const artistId = (await params).artistId;
	const { id: userId } = await getUserSession();

	const defaultTrack = await getTrackRanking(userId, trackId);
	const { menuOptions, parentOptions } = await getTrackComparisonOptions(
		userId,
		artistId
	);

	if (!defaultTrack) notFound();

	return (
		<div className="space-y-16">
			<SegmentControl
				options={TRACK_SEGMENT_OPTIONS}
				variant="simple"
				defaultValue="artist"
			/>
			<div className="flex gap-4 [&>div]:flex-1 [&>div]:p-8">
				{[1, 2, 3, 4].map((item) => (
					<Card
						key={item}
						className="bg-gradient-to-b from-transparent to-neutral-950"
					>
						<h3 className="text-base text-neutral-500">Album Rankings</h3>
					</Card>
				))}
			</div>
			<Card className="space-y-8 p-12">
				<RankingLineChart
					title="Track Ranking Trends"
					defaultData={defaultTrack}
					menuOptions={menuOptions}
					parentOptions={parentOptions}
					config={{
						dataKey: "ranking",
						isReverse: true,
						hasToggle: false,
					}}
					onLoadComparisonData={getComparisonTracksData}
				/>
			</Card>
		</div>
	);
}
