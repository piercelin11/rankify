import { cache } from "react";
import { db } from "@/db/client";
import { UserArtistAchievementType } from "@/types/achievement";

type GetUserArtistAchievementProps = {
	userId: string;
	artistId: string;
};

export const getUserArtistAchievement = cache(
	async ({
		userId,
		artistId,
	}: GetUserArtistAchievementProps): Promise<UserArtistAchievementType> => {
		// 並行查詢 1-3: submission 統計 + 總互動數
		const [artistModeCount, albumModeCount, submissions] = await Promise.all([
			// 查詢 1: Artist mode 完成次數
			db.rankingSubmission.count({
				where: { userId, artistId, type: "ARTIST", status: "COMPLETED" },
			}),

			// 查詢 2: Album mode 完成次數
			db.rankingSubmission.count({
				where: { userId, artistId, type: "ALBUM", status: "COMPLETED" },
			}),

			// 查詢 3: 取得所有 COMPLETED submissions 的 trackRanks 數量
			db.rankingSubmission.findMany({
				where: { userId, artistId, status: "COMPLETED" },
				select: {
					_count: { select: { trackRanks: true } },
				},
			}),
		]);

		// 計算總歌曲互動數（所有 submission 的歌曲數累加）
		const totalSongInteractions = submissions.reduce(
			(sum, s) => sum + s._count.trackRanks,
			0
		);

		// 查詢 4: 專輯精通狀態
		// 取得該藝人的所有專輯及其歌曲的 TrackStat 記錄
		const albums = await db.album.findMany({
			where: { artistId },
			select: {
				id: true,
				tracks: {
					select: {
						id: true,
						trackStats: {
							where: { userId },
							select: { id: true },
						},
					},
				},
			},
		});

		// 計算精通專輯數：該專輯的所有歌曲都有 TrackStat 記錄
		const masteredAlbums = albums.filter((album) =>
			album.tracks.every((track) => track.trackStats.length > 0)
		).length;

		const totalAlbums = albums.length;
		const masteryPercentage =
			totalAlbums === 0 ? 0 : (masteredAlbums / totalAlbums) * 100;

		return {
			artistModeCount,
			albumModeCount,
			masteredAlbums,
			totalAlbums,
			totalSongInteractions,
			masteryPercentage,
		};
	}
);
