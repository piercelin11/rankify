import { cache } from "react";
import { db } from "@/db/client";
import type { DraftItemType } from "@/types/home";

export const getUserDrafts = cache(
	async ({ userId }: { userId: string }): Promise<DraftItemType[]> => {
		const drafts = await db.rankingSubmission.findMany({
			where: {
				userId,
				status: { in: ["IN_PROGRESS", "DRAFT"] },
			},
			include: {
				artist: {
					select: { id: true, name: true, img: true },
				},
				album: {
					select: { id: true, name: true, img: true },
				},
			},
			orderBy: { updatedAt: "desc" },
		});

		// 🔧 防禦性過濾: 移除無效資料
		return drafts.filter((draft) => {
			// 驗證 1: ALBUM 類型必須有 albumId
			if (draft.type === "ALBUM" && !draft.albumId) {
				console.warn(
					`[Data Integrity] Invalid draft: type=ALBUM but albumId=null`,
					{ draftId: draft.id, userId: draft.userId },
				);
				return false;
			}

			// 驗證 2: draftState 必須是有效物件且包含 percent
			if (
				!draft.draftState ||
				typeof draft.draftState !== "object" ||
				Array.isArray(draft.draftState) ||
				!("percent" in draft.draftState)
			) {
				console.warn(
					`[Data Integrity] Invalid draft: draftState missing or invalid`,
					{ draftId: draft.id, userId: draft.userId },
				);
				return false;
			}

			return true;
		}) as DraftItemType[];
	},
);
