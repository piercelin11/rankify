export function generateSearchParams(object: {
	[key: string]: string;
}): string {
	return new URLSearchParams(object).toString();
}