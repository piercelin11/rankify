import { getDevInputTypeError } from "@/constants/devErrors.constants";

export function dateToLong(input: Date) {
	if (!(input instanceof Date)) {
		throw new Error(getDevInputTypeError("Date", typeof input));
	}

	const formattedDate = input.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	return formattedDate;
}

export function dateToDashFormat(input: Date) {
	if (!(input instanceof Date)) {
		throw new Error(getDevInputTypeError("Date", typeof input));
	}

	const year = input.getFullYear();
	const month = (input.getMonth() + 1).toString().padStart(2, "0");
	const day = input.getDate().toString().padStart(2, "0");

	const formattedDate = `${year}-${month}-${day}`;
	return formattedDate;
}

export function calculateDateRangeFromSlug(
	rangeSlug: string | undefined
): Date | undefined {
	if (rangeSlug === undefined) return undefined;

	if (typeof rangeSlug !== "string") {
		throw new Error(getDevInputTypeError("Date", typeof rangeSlug));
	}
	const now = new Date();
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

	return startDate;
}
