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

export type getPastDateProps = {
	days?: number;
	weeks?: number;
	months?: number;
	years?: number;
};

export function getPastDate({
	days = 0,
	weeks = 0,
	months = 0,
	years = 0,
}: getPastDateProps) {
	if (!days && !weeks && !months && !years) return undefined;

	const date = new Date();
	date.setDate(date.getDate() - days);
	date.setDate(date.getDate() - weeks * 7);
	date.setMonth(date.getMonth() - months);
	date.setFullYear(date.getFullYear() - years);

	return date;
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
	const previousIndex =
		currentIndex !== 0 ? currentIndex - 1 : data.length - 1;
	const nextIndex = currentIndex !== data.length - 1 ? currentIndex + 1 : 0;

	return {previousIndex, nextIndex}
}
