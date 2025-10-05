import { getUserSession } from "@/../auth";
import { getAlbumById } from "@/db/album";
import { getIncompleteRankingSubmission } from "@/db/ranking";
import { getTracksByAlbumId } from "@/db/track";
import SorterWithConflictResolver from "@/features/sorter/components/SorterWithConflictResolver";
import { sorterStateSchema } from "@/lib/schemas/sorter";
import { createSubmission } from "@/features/sorter/actions/createSubmission";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type pageProps = {
	params: Promise<{ albumId: string }>;
};

export default async function page({ params }: pageProps) {
	const { albumId } = await params;
	const { id: userId } = await getUserSession();

	const album = await getAlbumById({ albumId });
	if (!album) notFound();

	let submission = await getIncompleteRankingSubmission({
		artistId: album.artistId,
		userId,
		type: "ALBUM",
		albumId,
	});

	const tracks = await getTracksByAlbumId({ albumId });

	if (!submission) {

		if (tracks.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-20">
					<p className="text-lg">此專輯無歌曲資料</p>
					<Link href={`/album/${albumId}`}>
						<Button className="mt-4">返回專輯頁面</Button>
					</Link>
				</div>
			);
		}

		const submissionResult = await createSubmission({
			selectedAlbumIds: [albumId],
			selectedTrackIds: tracks.map((t) => t.id),
			type: "ALBUM",
			artistId: album.artistId,
			albumId,
		})

		if (submissionResult.data) submission = submissionResult.data;

		//redirect(`/sorter/album/${albumId}`);
	}

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
