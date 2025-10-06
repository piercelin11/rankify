import { getUserSession } from "@/../auth";
//import { getTracksHistory } from "@/services/track/getTracksHistory";
//import { getLoggedAlbumNames } from "@/db/album";
import { artistViewParamsSchema } from "@/lib/schemas/artist";
import MyStatsToolbar from "@/components/artist/MyStatsToolbar";
import { Card } from "@/components/ui/card";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import { getAlbumsHistory } from "@/services/album/getAlbumsHistory";
import SimpleDropdown from "@/components/dropdown/SimpleDropdown";
import { getArtistRankingSubmissions } from "@/db/ranking";
import { notFound } from "next/navigation";
import { dateToDashFormat } from "@/lib/utils";

type PageProps = {
	params: Promise<{ artistId: string; submissionId: string }>;
	searchParams: Promise<{ view?: string }>;
};

export default async function SnapshotPage({
	params,
	searchParams,
}: PageProps) {
	const { artistId, submissionId } = await params;
	const { view: rawView } = await searchParams;
	const { id: userId } = await getUserSession();

	const submissions = await getArtistRankingSubmissions({ artistId, userId });
	const currentSubmissions = submissions.find((s) => s.id === submissionId);

	if (!currentSubmissions) {
		notFound();
	}

	const view = artistViewParamsSchema.parse(rawView);
	const albumRankings = await getAlbumsHistory({
		artistId,
		userId,
		submissionId,
	});

	// 獲取 Snapshot 資料
	/* const trackRankings = await getTracksHistory({
		artistId,
		userId,
		submissionId,
	});
	const albums = await getLoggedAlbumNames({ artistId, userId }); */

	return (
		<>
			<div className="space-y-10 p-content">
				{/* 控制項區域 */}
				<MyStatsToolbar
					artistId={artistId}
					activeTab="history"
					latestSubmissionId={submissions[0].id}
				/>
				{/* 資料區域 */}
				<section className="space-y-6">
					<div className="flex items-center gap-2">
						<p className="text-muted-foreground text-sm">View stats from:</p>
						<SimpleDropdown
							size="sm"
							className="w-fit min-w-36 border-transparent bg-muted"
							value={currentSubmissions.id}
							defaultValue={currentSubmissions.id}
							placeholder={dateToDashFormat(currentSubmissions.date)}
							options={submissions.map((s) => ({
								value: s.id,
								label: dateToDashFormat(s.date),
								href: `/artist/${artistId}/my-stats/${s.id}?view=${view}`,
							}))}
						/>
					</div>
					<Card className="p-12">
						<h2 className="mb-4">Your Album Points</h2>
						<DoubleBarChart
							labels={albumRankings.map((album) => album.name)}
							datasets={[
								{
									label: "points",
									data: albumRankings.map((album) => album.totalPoints),
									hoverColor: albumRankings.map((album) => album.color ?? "#464748"),
								},
								{
									label: "previous points",
									data: albumRankings.map((album) => album.previousTotalPoints ?? 0),
									color: "#464748BF",
									hoverColor: albumRankings.map((album) => album.color ?? "#464748"),
								},
							]}
						/>
					</Card>
				</section>
			</div>
		</>
	);
}
