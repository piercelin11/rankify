import { getUserSession } from "@/../auth";
import { getAlbumsByArtistId } from "@/db/album";
import { getIncompleteRankingSubmission } from "@/db/ranking";
import getTracksByArtistId, { getSinglesByArtistId } from "@/db/track";
import FilterStage from "@/features/sorter/components/FilterStage";
import SorterWithConflictResolver from "@/features/sorter/components/SorterWithConflictResolver";
import { sorterStateSchema } from "@/lib/schemas/sorter";

type pageProps = {
	params: Promise<{ artistId: string }>;
};

export default async function page({ params }: pageProps) {
	const { artistId } = await params;
	const { id: userId } = await getUserSession();
	const submission = await getIncompleteRankingSubmission({ artistId, userId });

	const singles = await getSinglesByArtistId({ artistId });
	const albums = await getAlbumsByArtistId({ artistId });
	const tracks = await getTracksByArtistId({ artistId });

	if (!submission) return <FilterStage albums={albums} singles={singles} />;

	const validation = sorterStateSchema.safeParse(submission.draftState);

	if (!validation.success) {
		console.error(
			`Submission data with the id ${submission.id} has an invalid draftState`,
			validation.error
		);
		//TODO: 優雅處理錯誤
		return <p>排名資料已損毀，請重新開始</p>;
	}

	if (submission.status === "IN_PROGRESS" || submission.status === "DRAFT") {
		return (
			<SorterWithConflictResolver
				serverDraft={{
					state: validation.data,
					updatedAt:
						submission.updatedAt?.toISOString() || new Date().toISOString(),
				}}
				tracks={tracks}
				submissionId={submission.id}
				userId={userId}
				status={submission.status}
			/>
		);
	}

	return <div></div>;
}
