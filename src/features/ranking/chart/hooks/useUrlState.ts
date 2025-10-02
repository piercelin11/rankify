import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useUrlState() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const updateUrlParams = useCallback((
		updater: (params: URLSearchParams) => void
	) => {
		const params = new URLSearchParams(searchParams);
		updater(params);

		const newUrl = `${pathname}?${params.toString()}`;
		router.replace(newUrl, { scroll: false });
	}, [searchParams, router, pathname]);

	const addToArray = useCallback((key: string, value: string) => {
		updateUrlParams((params) => {
			params.append(key, value);
		});
	}, [updateUrlParams]);

	const removeFromArray = useCallback((key: string, value: string) => {
		updateUrlParams((params) => {
			const values = params.getAll(key).filter(v => v !== value);
			params.delete(key);
			values.forEach(v => params.append(key, v));
		});
	}, [updateUrlParams]);

	const clearArray = useCallback((key: string) => {
		updateUrlParams((params) => {
			params.delete(key);
		});
	}, [updateUrlParams]);

	const getArray = (key: string): string[] => {
		return searchParams.getAll(key);
	};

	return {
		addToArray,
		removeFromArray,
		clearArray,
		getArray,
		updateUrlParams,
	};
}