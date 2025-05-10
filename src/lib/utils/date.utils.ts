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