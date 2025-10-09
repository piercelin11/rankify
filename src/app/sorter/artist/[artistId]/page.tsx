import { getUserSession } from "@/../auth";
import { getAlbumsByArtistId } from "@/db/album";
import { getIncompleteRankingSubmission } from "@/db/ranking";
import getTracksByArtistId, { getSinglesByArtistId } from "@/db/track";
import FilterStage from "@/features/sorter/components/FilterStage";
import { DraftPrompt } from "@/features/sorter/components/DraftPrompt";
import { CorruptedDraftFallback } from "@/features/sorter/components/CorruptedDraftFallback";
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

	// 🟢 Server Component 條件渲染：沒有草稿 → 直接顯示 FilterStage
	if (!submission) {
		return <FilterStage albums={albums} singles={singles} />;
	}

	// 🟢 驗證草稿資料
	const validation = sorterStateSchema.safeParse(submission.draftState);
	if (!validation.success) {
		// 資料損毀 → 用 Client Component 處理刪除 + Loading 狀態
		return (
			<CorruptedDraftFallback
				submissionId={submission.id}
				redirectPath={`/sorter/artist/${artistId}`}
			/>
		);
	}

	// 🟢 Server Component 條件渲染：有草稿 → 渲染 DraftPrompt
	// DraftPrompt 內部處理 Modal 與 RankingStage 的切換
	return (
		<DraftPrompt
			submissionId={submission.id}
			draftState={validation.data}
			draftDate={submission.updatedAt || submission.createdAt}
			tracks={tracks}
			userId={userId}
		/>
	);
}
