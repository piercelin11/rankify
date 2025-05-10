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