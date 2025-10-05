import { getUserSession } from "@/../auth";
import { calculateDateRangeFromSlug } from "@/lib/utils";
import getTracksStats from "@/services/track/getTracksStats";
import getAlbumsStats from "@/services/album/getAlbumsStats";
import { getLoggedAlbumNames, getAlbumRankingSessions } from "@/db/album";
//import { getArtistRankingSubmissions } from "@/db/ranking";
//import HybridDataSourceControl from "@/components/artist/HybridDataSourceControl";
//import UnderlinedTabs from "@/components/navigation/UnderlinedTabs";
import OverviewView from "@/features/ranking/views/OverviewView";
import AllRankingsView from "@/features/ranking/views/AllRankingsView";
import {
	ArtistRangeParamsSchema,
	ArtistViewParamsSchema,
} from "@/lib/schemas/artist";
import SimpleSegmentControl from "@/components/navigation/SimpleSegmentControl";
import PillTabs from "@/components/navigation/PillTabs";

type PageProps = {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ view?: string; range?: string }>;
};

export default async function MyStatsPage({ params, searchParams }: PageProps) {
	const { artistId } = await params;
	const { view: rawView, range: rawRange } = await searchParams;

	const view = ArtistViewParamsSchema.parse(rawView);
	const range = ArtistRangeParamsSchema.parse(rawRange);

	const { id: userId } = await getUserSession();

	const dateRange = calculateDateRangeFromSlug(range);

	// 獲取 Track 資料
	const trackRankings = await getTracksStats({
		artistId,
		userId,
		dateRange,
	});

	// 條件性獲取 Album 資料（只在 Overview 視圖需要）
	const albumData =
		view === "overview"
			? {
					albumRankings: await getAlbumsStats({
						artistId,
						userId,
						dateRange,
					}),
					albumSessions: await getAlbumRankingSessions({ userId, artistId }),
				}
			: null;

	const albums = await getLoggedAlbumNames({ artistId, userId, dateRange });

	// 獲取 sessions（用於控制項）
	//const sessions = await getArtistRankingSubmissions({ artistId, userId });

	return (
		<>
			{/* 控制項區域 */}
			<div className="space-y-6 p-content">
				<SimpleSegmentControl
					value={view}
					variant="primary"
					options={[
						{
							label: "Overview",
							value: "overview",
							queryParam: ["view", "overview"],
						},
						{
							label: "All Rankings",
							value: "all-rankings",
							queryParam: ["view", "all-rankings"],
						},
					]}
					size="md"
				/>
				{/* <UnderlinedTabs
					value={view}
					options={[
						{
							label: "Overview",
							value: "overview",
						},
						{
							label: "All Rankings",
							value: "all-rankings",
						},
					]}
				/> */}
				<PillTabs
					value={view}
					options={[
						{
							label: "Overview",
							value: "overview",
						},
						{
							label: "All Rankings",
							value: "all-rankings",
						},
					]}
				/> 
				
			</div>

			{/* 視圖渲染 */}
			{view === "overview" ? (
				<OverviewView
					mode="average"
					albumRankings={albumData?.albumRankings}
					albumSessions={albumData?.albumSessions}
					artistId={artistId}
				/>
			) : (
				<AllRankingsView
					mode="average"
					trackRankings={trackRankings}
					albums={albums.map((album) => album.name)}
				/>
			)}
		</>
	);
}
