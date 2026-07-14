import { requireSession } from "@/../auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTracksHistory } from "@/services/track/getTracksHistory";
import { getLoggedAlbumNames } from "@/db/album";
import { getArtistRankingSubmissions } from "@/db/ranking";
import RankingTable from "@/features/ranking/table/RankingTable";

type PageProps = {
	params: Promise<{ artistId: string; submissionId: string }>;
};

export default async function SnapshotAllRankingsPage({ params }: PageProps) {
	const { artistId, submissionId } = await params;
	const { id: userId } = await requireSession();

	const submissions = await getArtistRankingSubmissions({ artistId, userId });
	const currentSubmission = submissions.find((s) => s.id === submissionId);
	if (!currentSubmission) notFound();

	const [trackHistory, albums] = await Promise.all([
		getTracksHistory({ artistId, userId, submissionId }),
		getLoggedAlbumNames({ artistId, userId }),
	]);

	return (
		<div className="space-y-10 p-content">
			<Link href={`/artist/${artistId}/${submissionId}`}>
				<Button variant="ghost" size="sm">
					<ArrowLeft /> Back
				</Button>
			</Link>
			<RankingTable
				artistId={artistId}
				data={trackHistory}
				submissions={submissions}
				currentSubmissionId={submissionId}
				columnKey={["peak", "achievement"]}
				availableAlbums={albums.map((album) => album.name)}
				view="snapshot"
			/>
		</div>
	);
}
