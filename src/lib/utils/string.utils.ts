import { getDevInputTypeError } from "@/constants";

export function toAcronym(input: string) {
	if (typeof input !== "string")
		throw new Error(getDevInputTypeError("string", typeof input));

	const cleanedString = input.replace(/\(.*?\)|\[.*?\]/g, "").trim();

	if (cleanedString.length > 18) {
		const words = cleanedString.split(" ");
		const initials = words.map((item) => item.charAt(0));
		return initials.join("").toUpperCase();
	} else {
		return cleanedString;
	}
}

export function capitalizeFirstLetter(input: string): string {
	if (typeof input !== "string")
		throw new Error(getDevInputTypeError("string", typeof input));
	return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}
