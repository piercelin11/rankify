"use client";

import { useTransition, useCallback } from "react";
import { AppResponseType } from "@/types/response";

/**
 * useServerAction Hook
 * 為 Server Actions 提供極簡的 transition wrapper + 型別安全
 * @example
 * const { execute, isPending } = useServerAction(updateTrack);
 *
 * async function handleSubmit(formData: FormData) {
 *   const result = await execute(formData);
 *   if (result.type === "error") {
 *     setError(result.message);
 *   } else {
 *     toast.success(result.message);
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useServerAction<TArgs extends any[], TData = undefined>(
	action: (...args: TArgs) => Promise<AppResponseType<TData>>
) {
	const [isPending, startTransition] = useTransition();

	const execute = useCallback(
		(...args: TArgs) => {
			return new Promise<AppResponseType<TData>>((resolve) => {
				startTransition(async () => {
					resolve(await action(...args));
				});
			});
		},
		[action]
	);

	return { execute, isPending };
}
