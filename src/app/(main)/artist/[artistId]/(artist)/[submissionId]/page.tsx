import { requireSession } from "@/../auth";
import { getTracksHistory } from "@/services/track/getTracksHistory";
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
import StatsCard from "@/components/card/StatsCard";
import { PLACEHOLDER_PIC } from "@/constants/placeholder.constants";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
	const { id: userId } = await requireSession();

	const submissions = await getArtistRankingSubmissions({ artistId, userId });
	const currentSubmission = submissions.find((s) => s.id === submissionId);

	if (!currentSubmission) {
		notFound();
	}

	const view = artistViewParamsSchema.parse(rawView);
	const albumRankings = await getAlbumsHistory({
		artistId,
		userId,
		submissionId,
	});

	const trackHistory = await getTracksHistory({
		artistId,
		userId,
		submissionId,
	});
	// 獲取 Snapshot 資料
	/* 
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
				<section className="space-y-4">
					<div className="flex items-center gap-2 mb-10">
						<p className="text-sm text-muted-foreground">View stats from:</p>
						<SimpleDropdown
							size="sm"
							className="w-fit min-w-36 border-transparent bg-secondary"
							value={currentSubmission.id}
							placeholder={dateToDashFormat(currentSubmission.date)}
							options={submissions.map((s) => ({
								value: s.id,
								label: dateToDashFormat(s.date),
								href: `/artist/${artistId}/${s.id}?view=${view}`,
							}))}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
						<StatsCard className="space-y-3">
							{trackHistory.slice(0, 3).map((track) => (
								<div key={track.id} className="flex items-center gap-2">
									<p className="min-w-5 font-numeric text-lg text-secondary-foreground">
										{track.rank}
									</p>
									<Image
										src={track.img || PLACEHOLDER_PIC}
										alt={`${track.name} cover`}
										className="rounded-lg"
										width={50}
										height={50}
									/>
									<div className="overflow-hidden">
										<p className="truncate font-medium">{track.name}</p>
										<p className="truncate text-sm text-muted-foreground">
											{track.album?.name}
										</p>
									</div>
								</div>
							))}
							<Link
								href={`/artist/${trackHistory[0].artistId}?view=all-rankings&submissionId=${submissionId}`}
								className="ml-auto flex items-center gap-1 text-sm text-foreground hover:text-primary"
							>
								Full rankings
								<ArrowRight size={16} />
							</Link>
						</StatsCard>
						<StatsCard
							title={"item.title"}
							value={"item.value"}
							subtitle={"item.subtitle"}
						/>
						<StatsCard
							title={"item.title"}
							value={"item.value"}
							subtitle={"item.subtitle"}
						/>
						<StatsCard
							title={"item.title"}
							value={"item.value"}
							subtitle={"item.subtitle"}
						/>
					</div>
					<Card className="p-6">
						<h2 className="mb-4">Your Album Points</h2>
						<DoubleBarChart
							labels={albumRankings.map((album) => album.name)}
							datasets={[
								{
									label: "points",
									data: albumRankings.map((album) => album.totalPoints),
									hoverColor: albumRankings.map(
										(album) => album.color ?? "#464748"
									),
								},
								{
									label: "previous points",
									data: albumRankings.map(
										(album) => album.previousTotalPoints ?? 0
									),
									color: "#464748BF",
									hoverColor: albumRankings.map(
										(album) => album.color ?? "#464748"
									),
								},
							]}
						/>
					</Card>
				</section>
			</div>
		</>
	);
}
