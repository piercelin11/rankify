export function generateSearchParams(object: {
	[key: string]: string;
}): string {
	return new URLSearchParams(object).toString();
}

export type ParsedPathname = {
	segments: string[];
	artistId?: string;
	params: Record<string, string>;
};

export function parsePathnameFromHeaders(headersList: Headers): ParsedPathname | null {
	const pathname = headersList.get('x-current-path');

	if (!pathname) {
		return null;
	}

	return parsePathname(pathname);
}

export function parsePathname(pathname: string): ParsedPathname {
	// 移除開頭的 / 並分割路徑
	const segments = pathname.replace(/^\/+/, '').split('/').filter(Boolean);

	// 提取動態參數
	const params: Record<string, string> = {};
	let artistId: string | undefined;

	// 尋找 artist ID（通常在 artist/ 後面）
	const artistIndex = segments.findIndex(segment => segment === 'artist');
	if (artistIndex !== -1 && segments[artistIndex + 1]) {
		artistId = segments[artistIndex + 1];
		params.artistId = artistId;
	}

	// 可以根據需要提取其他參數
	segments.forEach((segment, index) => {
		// 檢查是否為動態路由參數（包含特殊字符或看起來像 ID）
		if (segment.match(/^[a-zA-Z0-9_-]+$/) && segments[index - 1]) {
			const paramName = segments[index - 1];
			if (['artist', 'album', 'track', 'dateId', 'rangeSlug'].includes(paramName)) {
				params[paramName + 'Id'] = segment;
			}
		}
	});

	return {
		segments,
		artistId,
		params
	};
}
