import { getDevInputTypeError } from "@/constants";
import { isArray } from "chart.js/helpers";

type GetPrevNextIndex<T> = {
	items: T[];
	targetItemId: T[keyof T];
};

export function getPrevNextIndex<T extends { id: string }>({
	items,
	targetItemId,
}: GetPrevNextIndex<T>) {
	if (!isArray(items))
		throw new Error(getDevInputTypeError("array", typeof items));

	const currentIndex = items.findIndex((item) => item.id === targetItemId);

	if (currentIndex === -1)
		throw new Error(
			`Item with ID "${targetItemId}" not found in the items array`
		);

	const previousIndex =
		currentIndex !== 0 ? currentIndex - 1 : items.length - 1;
	const nextIndex = currentIndex !== items.length - 1 ? currentIndex + 1 : 0;

	return { previousIndex, nextIndex };
}
