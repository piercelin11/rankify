type GetPrevNextIndex<T> = {
	data: T[];
	key: T[keyof T];
};

export function getPrevNextIndex<T extends { id: string }>({
	data,
	key,
}: GetPrevNextIndex<T>) {
	const currentIndex = data.findIndex((data) => data.id === key);
	const previousIndex = currentIndex !== 0 ? currentIndex - 1 : data.length - 1;
	const nextIndex = currentIndex !== data.length - 1 ? currentIndex + 1 : 0;

	return { previousIndex, nextIndex };
}