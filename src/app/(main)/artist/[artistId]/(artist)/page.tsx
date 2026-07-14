import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/../auth";
import { artistRangeParamsSchema } from "@/lib/schemas/artist";
import { calculateDateRangeFromSlug } from "@/lib/utils";
import { PLACEHOLDER_PIC } from "@/constants";
import { Button } from "@/components/ui/button";
import { getAlbumsByArtistId } from "@/db/album";
import { getArtistById } from "@/db/artist";
import getAlbumsStats from "@/services/album/getAlbumsStats";
import getTracksStats from "@/services/track/getTracksStats";
import { getArtistRankingSubmissions } from "@/db/ranking";
import MyStatsToolbar from "@/components/artist/MyStatsToolbar";
import TopTracksCard from "@/features/ranking/top-tracks/TopTracksCard";
import LinkedAlbumCharts from "@/features/ranking/chart/LinkedAlbumCharts";
import LockedStatsPanel from "@/features/artist/components/LockedStatsPanel";
import SurpriseMeButton from "@/features/artist/components/SurpriseMeButton";
import {
	getAlbumScoreHistory,
	getUnweightedAlbumScoreHistory,
} from "@/features/album-points-lab/getAlbumScoreHistory";
import LatestAlbumScoreChartCard from "@/features/ranking/album-ranking/LatestAlbumScoreChartCard";
import { toAverageRankingItems } from "@/features/ranking/album-ranking/utils/toRankingItems";

type PageProps = {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{
		range?: string;
	}>;
};

export default async function MyStatsPage({ params, searchParams }: PageProps) {
	const { artistId } = await params;
	const query = await searchParams;

	const range = artistRangeParamsSchema.parse(query.range);

	const user = await getSession();

	if (!user) {
		const [albums, artist] = await Promise.all([
			getAlbumsByArtistId({ artistId }),
			getArtistById({ artistId }),
		]);

		if (!artist) {
			return null;
		}

		return (
			<div className="p-content space-y-14">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<h2 className="text-3xl font-bold">{artist.name}</h2>
					<SurpriseMeButton albums={albums} artistId={artistId} />
				</div>

				<div className="space-y-3">
					<h3 className="text-2xl font-semibold">Albums</h3>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-6 xl:grid-cols-8">
						{albums.map((album) => (
							<div key={album.id}>
								<div className="group relative aspect-square w-full overflow-hidden rounded-lg">
									<Link href={`/artist/${artistId}/album/${album.id}`}>
										<Image
											src={album.img || PLACEHOLDER_PIC}
											alt={album.name}
											fill
											sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 17vw"
											className="object-cover transition-all duration-300 group-hover:scale-105"
										/>
									</Link>
									<div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
										<Link href={`/sorter/album/${album.id}`}>
											<Button
												variant="primary"
												size="icon"
												className="h-10 w-10 rounded-full shadow-lg"
											>
												<Plus className="h-4 w-4" />
											</Button>
										</Link>
									</div>
								</div>
								<div className="mt-2">
									<Link href={`/artist/${artistId}/album/${album.id}`}>
										<h3 className="cursor-pointer truncate text-base font-semibold hover:underline">
											{album.name}
										</h3>
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>

				<LockedStatsPanel artistName={artist.name} />
			</div>
		);
	}

	const userId = user.id;
	const dateRange = calculateDateRangeFromSlug(range);

	const submissions = await getArtistRankingSubmissions({ artistId, userId });
	const latestSubmissionId = submissions[0]?.id;
	//TODO:處理沒有資料的回傳畫面
	if (!latestSubmissionId) return null;

	const [trackStats, albumStats, weightedHistory, unweightedHistory] =
		await Promise.all([
			getTracksStats({ artistId, userId }),
			getAlbumsStats({ artistId, userId, dateRange }),
			getAlbumScoreHistory({ artistId, userId }),
			getUnweightedAlbumScoreHistory({ artistId, userId }),
		]);

	const topTracks = trackStats.slice(0, 5);

	const weightedItems = toAverageRankingItems(albumStats, weightedHistory);
	const unweightedItems = toAverageRankingItems(albumStats, unweightedHistory);

	return (
		<div className="space-y-10 p-content">
			<MyStatsToolbar
				artistId={artistId}
				activeTab="overview"
				latestSubmissionId={latestSubmissionId}
			/>

			<TopTracksCard
				tracks={topTracks}
				columnKey={["highestRank"]}
				title="Your Top Tracks"
				fullRankingHref={`/artist/${artistId}/all-rankings`}
			/>

			<LinkedAlbumCharts albumStats={albumStats} />

			<LatestAlbumScoreChartCard
				weightedItems={weightedItems}
				unweightedItems={unweightedItems}
			/>
		</div>
	);
}
