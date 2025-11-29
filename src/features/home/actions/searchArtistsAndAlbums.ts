"use server";

import { db } from "@/db/client";
import type { SearchResultType } from "@/types/home";

export default async function searchArtistsAndAlbums({
	query,
}: {
	query: string;
}): Promise<SearchResultType> {
	if (!query.trim()) {
		return { artists: [], albums: [] };
	}

	const searchTerm = query.trim();

	// 並行查詢 Artists 和 Albums
	const [artists, albums] = await Promise.all([
		db.artist.findMany({
			where: {
				name: {
					contains: searchTerm,
					mode: "insensitive", // 不區分大小寫
				},
			},
			select: {
				id: true,
				name: true,
				img: true,
			},
			take: 5, // 限制結果數量
		}),
		db.album.findMany({
			where: {
				name: {
					contains: searchTerm,
					mode: "insensitive",
				},
			},
			select: {
				id: true,
				name: true,
				img: true,
				artistId: true, // ✅ 新增: 用於跳轉
				artist: {
					select: { name: true },
				},
			},
			take: 5,
		}),
	]);

	return {
		artists: artists.map((artist) => ({
			...artist,
			type: "artist" as const,
		})),
		albums: albums.map((album) => ({
			id: album.id,
			name: album.name,
			img: album.img,
			artistId: album.artistId, // ✅ 新增
			artistName: album.artist.name,
			type: "album" as const,
		})),
	};
}
