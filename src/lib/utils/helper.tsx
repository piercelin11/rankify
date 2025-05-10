export function generateSearchParams(object: {
	[key: string]: string;
}): string {
	return new URLSearchParams(object).toString();
}

export function dateToLong(date: Date) {
	const originalDate = new Date(date);
	const formattedDate = originalDate.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	return formattedDate;
}

export function dateToDashFormat(date: Date | null) {
	if (!date) return "No Date";
	const d = new Date(date);

	const year = d.getFullYear();
	const month = (d.getMonth() + 1).toString().padStart(2, "0");
	const day = d.getDate().toString().padStart(2, "0");

	const formattedDate = `${year}-${month}-${day}`;
	return formattedDate;
}

export function toAcronym(string: string) {
	if (!string) return;

	const cleanedString = string.replace(/\(.*?\)|\[.*?\]/g, "").trim();

	if (cleanedString.length > 18) {
		const words = cleanedString.split(" ");
		const initials = words.map((item) => item.charAt(0));
		return initials.join("").toUpperCase();
	} else {
		return cleanedString;
	}
}

export function calculateDateRangeFromSlug(rangeSlug: string): {
	startDate?: Date;
	endDate: Date;
} {
	const now = new Date();
	const endDate = now;
	let startDate: Date | undefined;

	switch (rangeSlug) {
		case "past-month": {
			const date = new Date(now);
			date.setMonth(date.getMonth() - 1);
			startDate = date;
			break;
		}
		case "past-6-months": {
			const date = new Date(now);
			date.setMonth(date.getMonth() - 6);
			startDate = date;
			break;
		}
		case "past-year": {
			const date = new Date(now);
			date.setFullYear(date.getFullYear() - 1);
			startDate = date;
			break;
		}
		case "past-2-years": {
			const date = new Date(now);
			date.setFullYear(date.getFullYear() - 2);
			startDate = date;
			break;
		}
		case "all-time": {
			startDate = undefined;
			break;
		}
		default: {
			startDate = undefined;
			break;
		}
	}

	return { startDate, endDate };
}

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

export function throttle<T extends (...args: any[]) => any>(
	fn: T,
	delay: number = 500
): (...args: Parameters<T>) => void {
	let timer: null | NodeJS.Timeout = null;
	return function (...args: Parameters<T>) {
		if (!timer) {
			fn(...args);
			timer = setTimeout(() => {
				timer = null;
			}, delay);
		}
	};
}

export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	delay: number = 500
): (...args: Parameters<T>) => void {
	let timer: undefined | NodeJS.Timeout;

	return function (...args: Parameters<T>) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			fn(...args);
		}, delay);
	};
}

export function fileToFileList(file: File) {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add(file);
	const fileList = dataTransfer.files;

	return fileList;
}
