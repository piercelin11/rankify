import { getUserSession } from "@/../auth";
import { calculateDateRangeFromSlug } from "@/lib/utils";
import getTracksStats from "@/services/track/getTracksStats";
import getAlbumsStats from "@/services/album/getAlbumsStats";
import { getLoggedAlbumNames, getAlbumRankingSessions } from "@/db/album";
import { getArtistRankingSubmissions } from "@/db/ranking";
import { isValidArtistView, type ArtistViewType } from "@/types/artist";
import HybridDataSourceControl from "@/components/artist/HybridDataSourceControl";
import SimpleSegmentControl from "@/components/navigation/SimpleSegmentControl";
import OverviewView from "@/features/ranking/views/OverviewView";
import AllRankingsView from "@/features/ranking/views/AllRankingsView";
import { redirect } from "next/navigation";

type PageProps = {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ view?: string; range?: string }>;
};

export default async function MyStatsPage({
	params,
	searchParams,
}: PageProps) {
	const { artistId } = await params;
	const { view: rawView, range } = await searchParams;

	// 驗證 view 參數，無效則重定向到乾淨的 base URL
	if (rawView && !isValidArtistView(rawView)) {
		redirect(`/artist/${artistId}/my-stats`);
	}

	const view = (rawView || "overview") as ArtistViewType;
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
					albumSessions: await getAlbumRankingSessions(userId, artistId),
				}
			: null;

	const albums = await getLoggedAlbumNames(artistId, userId, dateRange);

	// 獲取 sessions（用於控制項）
	const sessions = await getArtistRankingSubmissions(artistId, userId);

	return (
		<>
			{/* 控制項區域 */}
			<div className="flex items-center justify-between p-content">
				<HybridDataSourceControl
					artistId={artistId}
					currentSessionId={null}
					currentView={view}
					sessions={sessions.map((s) => ({ id: s.id, createdAt: s.date }))}
				/>
				<SimpleSegmentControl
					value={view}
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
