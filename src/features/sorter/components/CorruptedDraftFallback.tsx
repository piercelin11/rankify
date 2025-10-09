"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import deleteSubmission from "../actions/deleteSubmission";

type CorruptedDraftFallbackProps = {
	submissionId: string;
	redirectPath: string;
};

export function CorruptedDraftFallback({
	submissionId,
	redirectPath,
}: CorruptedDraftFallbackProps) {
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleDelete = () => {
		startTransition(async () => {
			try {
				const result = await deleteSubmission({ submissionId });
				if (result.type === "error") {
					setError(result.message);
					return;
				}
				router.push(redirectPath); // 觸發導航，會被 transition 追蹤
			} catch (err) {
				setError(err instanceof Error ? err.message : "未知錯誤");
			}
		});
	};

	return (
		<div className="flex flex-col items-center justify-center gap-4 py-20">
			<p className="text-destructive">排名資料已損毀，無法繼續</p>
			{error && (
				<p className="text-sm text-destructive">{error}</p>
			)}
			<Button
				onClick={handleDelete}
				disabled={isPending}
				variant="destructive"
			>
				{isPending ? "刪除中..." : "刪除草稿並重新開始"}
			</Button>
		</div>
	);
}
