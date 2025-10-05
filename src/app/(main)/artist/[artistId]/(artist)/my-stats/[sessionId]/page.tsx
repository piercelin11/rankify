import { getUserSession } from "@/../auth";
import { getTracksHistory } from "@/services/track/getTracksHistory";
import { getLoggedAlbumNames } from "@/db/album";
import { getArtistRankingSubmissions } from "@/db/ranking";
import HybridDataSourceControl from "@/components/artist/HybridDataSourceControl";
import SimpleSegmentControl from "@/components/navigation/SimpleSegmentControl";
import OverviewView from "@/features/ranking/views/OverviewView";
import AllRankingsView from "@/features/ranking/views/AllRankingsView";
import { notFound } from "next/navigation";
import { ArtistViewParamsSchema } from "@/lib/schemas/artist";

type PageProps = {
	params: Promise<{ artistId: string; sessionId: string }>;
	searchParams: Promise<{ view?: string }>;
};

export default async function SnapshotPage({
	params,
	searchParams,
}: PageProps) {
	const { artistId, sessionId } = await params;
	const { view: rawView } = await searchParams;
	const { id: userId } = await getUserSession();

	const view = ArtistViewParamsSchema.parse(rawView);

	// 驗證 sessionId 是否有效
	const sessions = await getArtistRankingSubmissions({ artistId, userId });
	const currentSession = sessions.find((s) => s.id === sessionId);

	if (!currentSession) {
		notFound();
	}

	// 獲取 Snapshot 資料
	const trackRankings = await getTracksHistory({
		artistId,
		userId,
		dateId: sessionId,
	});
	const albums = await getLoggedAlbumNames({ artistId, userId });

	return (
		<>
			{/* 控制項區域 */}
			<div className="flex items-center justify-between p-content">
				<HybridDataSourceControl
					artistId={artistId}
					currentSessionId={sessionId}
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
				<OverviewView mode="snapshot" artistId={artistId} />
			) : (
				<AllRankingsView
					mode="snapshot"
					trackRankings={trackRankings}
					albums={albums.map((album) => album.name)}
				/>
			)}
		</>
	);
}
