import { getSession } from "@/../auth";
import {
	getAlbumRankingSessions,
	getAlbumsByArtistId,
	getLoggedAlbumNames,
} from "@/db/album";
import MyStatsToolbar from "@/components/artist/MyStatsToolbar";
import OverviewView from "@/features/ranking/views/OverviewView";
import { cuidSchema } from "@/lib/schemas/general";
import {
	artistRangeParamsSchema,
	artistViewParamsSchema,
} from "@/lib/schemas/artist";
import { calculateDateRangeFromSlug, cn } from "@/lib/utils";
import getAlbumsStats from "@/services/album/getAlbumsStats";
import { getTracksHistory } from "@/services/track/getTracksHistory";
import getTracksStats from "@/services/track/getTracksStats";
import { getArtistRankingSubmissions } from "@/db/ranking";
import RankingTable from "@/features/ranking/table/RankingTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import { PLACEHOLDER_PIC } from "@/constants";

type PageProps = {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{
		view?: string;
		submissionId?: string;
		range?: string;
	}>;
};

export default async function MyStatsPage({ params, searchParams }: PageProps) {
	const { artistId } = await params;
	const query = await searchParams;

	const view = artistViewParamsSchema.parse(query.view);
	const range = artistRangeParamsSchema.parse(query.range);
	const submissionId = cuidSchema.optional().parse(query.submissionId);

	const user = await getSession();

	if (!user) {
		const albums = await getAlbumsByArtistId({ artistId });
		return (
			<div className="p-content">
				<h2>Albums</h2>
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
										className={cn(
											`object-cover transition-all duration-300 group-hover:scale-105`
										)}
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
		);
	}

	const userId = user.id;
	const dateRange = calculateDateRangeFromSlug(range);

	const submissions = await getArtistRankingSubmissions({ artistId, userId });
	const latestSubmissionId = submissions[0]?.id;
	//TODO:處理沒有資料的回傳畫面
	if (!latestSubmissionId) return null;

	let content: React.ReactNode;

	if (view === "overview") {
		const [trackStats, albumStats, albumSubmissions] = await Promise.all([
			getTracksStats({ artistId, userId }),
			getAlbumsStats({ artistId, userId, dateRange }),
			getAlbumRankingSessions({ userId, artistId }),
		]);

		content = (
			<OverviewView
				albumStats={albumStats}
				albumSubmissions={albumSubmissions}
				trackStats={trackStats}
			/>
		);
	} else if (submissionId) {
		const [trackRankings, albums] = await Promise.all([
			getTracksHistory({ artistId, userId, submissionId }),
			getLoggedAlbumNames({ artistId, userId, dateRange }),
		]);

		content = (
			<RankingTable
				data={trackRankings}
				submissions={submissions}
				currentSubmissionId={submissionId}
				columnKey={["peak", "achievement"]}
				availableAlbums={albums.map((album) => album.name)}
				view="snapshot"
			/>
		);
	} else {
		const [trackRankings, albums] = await Promise.all([
			getTracksStats({ artistId, userId }),
			getLoggedAlbumNames({ artistId, userId, dateRange }),
		]);

		content = (
			<RankingTable
				data={trackRankings}
				submissions={submissions}
				currentSubmissionId={submissionId}
				columnKey={["highestRank"]}
				availableAlbums={albums.map((album) => album.name)}
				view="average"
			/>
		);
	}

	return (
		<div className="p-content space-y-10">
			<MyStatsToolbar
				artistId={artistId}
				activeTab={view}
				latestSubmissionId={latestSubmissionId}
			/>
			{content}
		</div>
	);
}
