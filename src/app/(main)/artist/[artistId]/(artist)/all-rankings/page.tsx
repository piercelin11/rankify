import { requireSession } from "@/../auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import getTracksStats from "@/services/track/getTracksStats";
import { getLoggedAlbumNames } from "@/db/album";
import { getArtistRankingSubmissions } from "@/db/ranking";
import RankingTable from "@/features/ranking/table/RankingTable";

type PageProps = {
	params: Promise<{ artistId: string }>;
};

export default async function AllRankingsPage({ params }: PageProps) {
	const { artistId } = await params;
	const { id: userId } = await requireSession();

	const submissions = await getArtistRankingSubmissions({ artistId, userId });
	const [trackStats, albums] = await Promise.all([
		getTracksStats({ artistId, userId }),
		getLoggedAlbumNames({ artistId, userId }),
	]);

	return (
		<div className="space-y-10 p-content">
			<Link href={`/artist/${artistId}`}>
				<Button variant="ghost" size="sm">
					<ArrowLeft /> Back
				</Button>
			</Link>
			<RankingTable
				artistId={artistId}
				data={trackStats}
				submissions={submissions}
				columnKey={["streak", "averageRank", "highestRank"]}
				availableAlbums={albums.map((album) => album.name)}
				view="average"
			/>
		</div>
	);
}
