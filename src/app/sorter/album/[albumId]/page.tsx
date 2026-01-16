import { getSession } from "@/../auth";
import { getAlbumById } from "@/db/album";
import { getIncompleteRankingSubmission } from "@/db/ranking";
import { getTracksByAlbumId } from "@/db/track";
import { DraftPrompt } from "@/features/sorter/components/DraftPrompt";
import { CorruptedDraftFallback } from "@/features/sorter/components/CorruptedDraftFallback";
import { sorterStateSchema } from "@/lib/schemas/sorter";
import { createSubmission } from "@/features/sorter/actions/createSubmission";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GuestSorterEntry from "@/features/sorter/components/GuestSorterEntry";
import initializeSorterState from "@/features/sorter/utils/initializeSorterState";

type pageProps = {
	params: Promise<{ albumId: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function page({ params, searchParams }: pageProps) {
	const { albumId } = await params;
	const search = await searchParams;
	const shouldSkipPrompt = search?.skipPrompt === "true";

	const user = await getSession();
	const isGuest = !user;

	const album = await getAlbumById({ albumId });
	if (!album) notFound();

	const tracks = await getTracksByAlbumId({ albumId });

	// Guest 模式 → 渲染 GuestSorterEntry
	if (isGuest) {
		if (tracks.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-20">
					<p className="text-lg">No tracks available for this album</p>
					<Link href={`/album/${albumId}`}>
						<Button className="mt-4">Back to Album</Button>
					</Link>
				</div>
			);
		}

		// 直接使用 initializeSorterState 建立初始狀態
		const initialState = initializeSorterState(tracks);

		return (
			<GuestSorterEntry
				albumId={albumId}
				artistId={album.artistId}
				tracks={tracks}
				initialState={initialState}
			/>
		);
	}

	// User 模式
	const userId = user.id;

	const submission = await getIncompleteRankingSubmission({
		artistId: album.artistId,
		userId,
		type: "ALBUM",
		albumId,
	});

	// 沒有草稿 → 自動建立（不 redirect）
	if (!submission) {
		if (tracks.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-20">
					<p className="text-lg">No tracks available for this album</p>
					<Link href={`/album/${albumId}`}>
						<Button className="mt-4">Back to Album</Button>
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
		});

		// 建立失敗 → 顯示錯誤
		if (!submissionResult.data) {
			return (
				<div className="flex flex-col items-center gap-4 py-20">
					<p className="text-destructive">Failed to create ranking</p>
					<p className="text-sm text-muted-foreground">
						{submissionResult.message || "Unknown error"}
					</p>
				</div>
			);
		}

		// 建立成功 → 驗證並渲染 DraftPrompt
		const validation = sorterStateSchema.safeParse(
			submissionResult.data.draftState
		);
		if (!validation.success) {
			return (
				<CorruptedDraftFallback
					submissionId={submissionResult.data.id}
					redirectPath={`/sorter/album/${albumId}`}
				/>
			);
		}

		return (
			<DraftPrompt
				submissionId={submissionResult.data.id}
				draftState={validation.data}
				draftDate={
					submissionResult.data.updatedAt || submissionResult.data.createdAt
				}
				tracks={tracks}
				artistId={album.artistId}
				shouldSkipPrompt={shouldSkipPrompt}
			/>
		);
	}

	// 驗證既有草稿資料
	const validation = sorterStateSchema.safeParse(submission.draftState);
	if (!validation.success) {
		// 資料損毀 → 用 Client Component 處理刪除 + Loading 狀態
		return (
			<CorruptedDraftFallback
				submissionId={submission.id}
				redirectPath={`/sorter/album/${albumId}`}
			/>
		);
	}

	// 有草稿 → 渲染 DraftPrompt
	return (
		<DraftPrompt
			submissionId={submission.id}
			draftState={validation.data}
			draftDate={submission.updatedAt || submission.createdAt}
			tracks={tracks}
			artistId={album.artistId}
			shouldSkipPrompt={shouldSkipPrompt}
		/>
	);
}
