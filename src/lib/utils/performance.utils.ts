/* eslint-disable @typescript-eslint/no-explicit-any */
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

export async function mockFetchData<T>(data: T, delay: number = 5000): Promise<T> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(data);
		}, delay);
	});
}