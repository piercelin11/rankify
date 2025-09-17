export async function mockFetchData<T>(data: T, delay: number = 5000): Promise<T> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(data);
		}, delay);
	});
}