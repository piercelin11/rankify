import { getUserSession } from "@/../auth";
import SimpleSegmentControl from "@/components/navigation/SimpleSegmentControl";
import SimpleDropdown from "@/components/dropdown/SimpleDropdown";
import { VIEW_SEGMENT_OPTIONS } from "@/config/segmentOptions";
import ClientHistoryRankingTable from "@/features/ranking/table/client/ClientHistoryRankingTable";
import { getTracksHistory } from "@/services/track/getTracksHistory";
import { getLoggedAlbumNames } from "@/db/album";
import { getArtistRankingSessions } from "@/db/ranking";
import { dateToDashFormat } from "@/lib/utils";

type pageProps = {
	params: Promise<{ artistId: string; dateId: string }>;
	searchParams: Promise<{ view: string }>;
};

export default async function HistoryDatePage({ params, searchParams }: pageProps) {
	const { artistId, dateId } = await params;
	const resolvedSearchParams = await searchParams;
	const { view } = resolvedSearchParams;
	const { id: userId } = await getUserSession();

	const currentView = view || "list";

	const trackRankings = await getTracksHistory({
		artistId,
		userId,
		dateId,
	});

	const albums = await getLoggedAlbumNames(artistId, userId);
	const rankingSessions = await getArtistRankingSessions(artistId, userId);

	const dateOptions = rankingSessions.map((session) => ({
		value: session.id,
		label: dateToDashFormat(session.date),
		href: `/artist/${artistId}/history/${session.id}`,
	}));

	return (
		<div>
			<div className="p-content flex items-center justify-between gap-4">
				<SimpleSegmentControl
					options={VIEW_SEGMENT_OPTIONS}
					defaultValue={currentView}
				/>
				<SimpleDropdown
					options={dateOptions}
					defaultValue={dateId}
					placeholder="Select a date"
					className="w-60"
				/>
			</div>

			{currentView === "list" ? (
				<ClientHistoryRankingTable
					trackRankings={trackRankings}
					albums={albums.map((album) => album.name)}
				/>
			) : (
				<div className="p-content">
					<p className="text-muted-foreground">
						Charts view not available for historical data
					</p>
				</div>
			)}
		</div>
	);
}