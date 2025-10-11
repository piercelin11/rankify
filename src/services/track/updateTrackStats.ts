import { Prisma, TrackStat } from "@prisma/client";
//TODO: 確認submissioncount的意義與計算是否正確。
//TODO: Claude Code reivew。

/**
 * 用於定義 TrackStat 綜合排名的排序規則。
 * 規則: 1. 平均排名 -> 2. 最高排名 -> 3. 最低排名 -> 4. Track ID (穩定排序)
 */
const sortStats = (
	a: Pick<TrackStat, "averageRank" | "highestRank" | "lowestRank" | "trackId">,
	b: Pick<TrackStat, "averageRank" | "highestRank" | "lowestRank" | "trackId">
): number => {
	if (a.averageRank !== b.averageRank) {
		return a.averageRank - b.averageRank;
	}
	if (a.highestRank !== b.highestRank) {
		return a.highestRank - b.highestRank;
	}
	if (a.lowestRank !== b.lowestRank) {
		return a.lowestRank - b.lowestRank;
	}
	return b.trackId.localeCompare(a.trackId);
};

export async function updateTrackStats(
	tx: Prisma.TransactionClient,
	userId: string,
	artistId: string,
	trackRankData: Array<{
		trackId: string;
		rank: number;
		rankChange: number | null;
	}>
) {
	// 1️⃣ [讀取] 一次性取得該歌手的所有舊 TrackStat 資料
	const allOldStats = await tx.trackStat.findMany({
		where: { userId, artistId },
	});
	const oldStatsMap = new Map(allOldStats.map((s) => [s.trackId, s]));

	// 2️⃣ [記憶體計算] 準備一個 Map 來存放所有歌曲的「最終狀態」
	// 我們從舊的狀態開始，然後只更新有變動的部分
	const newStatsMap = new Map<string, TrackStat>(oldStatsMap);

	// 遍歷本次提交的排名，在記憶體中計算新的「絕對值」
	for (const track of trackRankData) {
		const oldStats = oldStatsMap.get(track.trackId);
		const currentRank = track.rank;
		const rankChange = track.rankChange;

		const submissionCount = (oldStats?.submissionCount ?? 0) + 1;
		const previousAverageRank = oldStats?.averageRank ?? null;
		const averageRank =
			previousAverageRank !== null
				? (previousAverageRank * (submissionCount - 1) + currentRank) /
					submissionCount
				: currentRank;

		const highestRank = Math.min(
			oldStats?.highestRank ?? Infinity,
			currentRank
		);
		const lowestRank = Math.max(oldStats?.lowestRank ?? 0, currentRank);

		let hotStreak = oldStats?.hotStreak ?? 0;
		let coldStreak = oldStats?.coldStreak ?? 0;
		if (rankChange !== null) {
			if (rankChange > 0) {
				hotStreak += 1;
				coldStreak = 0;
			} else if (rankChange < 0) {
				coldStreak += 1;
				hotStreak = 0;
			} else {
				hotStreak = 0;
				coldStreak = 0;
			}
		}

		const cumulativeRankChange =
			rankChange !== null
				? (oldStats?.cumulativeRankChange ?? 0) + Math.abs(rankChange)
				: (oldStats?.cumulativeRankChange ?? 0);

		// 將計算出的新狀態更新到 newStatsMap 中
		const newStatData: TrackStat = {
			...(oldStats ?? {
				id: "", // 臨時 ID，在 create 時 Prisma 會忽略
				userId,
				artistId,
				trackId: track.trackId,
				overallRank: 0, // 佔位符
				previousOverallRank: null,
				overallRankChange: null,
				createdAt: new Date(),
			}),
			submissionCount,
			averageRank,
			previousAverageRank,
			highestRank,
			lowestRank,
			hotStreak,
			coldStreak,
			cumulativeRankChange,
			updatedAt: new Date(),
		};

		newStatsMap.set(track.trackId, newStatData);
	}

	// 3️⃣ [記憶體排序與計算] 將 Map 轉為陣列，排序，並計算出最終的「相對值」
	const sortedFinalStats = Array.from(newStatsMap.values()).sort(sortStats);

	// 4️⃣ [準備寫入] 建立一個 Promise 陣列，用來存放所有資料庫的 upsert 操作
	const upsertPromises: Prisma.PrismaPromise<TrackStat>[] = [];

	sortedFinalStats.forEach((stat, index) => {
		const newOverallRank = index + 1;
		const oldStatFromOriginalMap = oldStatsMap.get(stat.trackId);
		const previousOverallRank = oldStatFromOriginalMap?.overallRank ?? null;

		const overallRankChange = previousOverallRank
			? previousOverallRank - newOverallRank
			: null;

		// 準備 Upsert 操作，包含所有絕對值和相對值的最終結果
		upsertPromises.push(
			tx.trackStat.upsert({
				where: { userId_trackId: { userId, trackId: stat.trackId } },
				create: {
					userId: stat.userId,
					artistId: stat.artistId,
					trackId: stat.trackId,
					submissionCount: stat.submissionCount,
					averageRank: stat.averageRank,
					highestRank: stat.highestRank,
					lowestRank: stat.lowestRank,
					hotStreak: stat.hotStreak,
					coldStreak: stat.coldStreak,
					cumulativeRankChange: stat.cumulativeRankChange,
					// 直接寫入計算好的最終排名
					overallRank: newOverallRank,
					previousOverallRank: null,
					overallRankChange: null,
				},
				update: {
					submissionCount: stat.submissionCount,
					averageRank: stat.averageRank,
					previousAverageRank: stat.previousAverageRank,
					highestRank: stat.highestRank,
					lowestRank: stat.lowestRank,
					hotStreak: stat.hotStreak,
					coldStreak: stat.coldStreak,
					cumulativeRankChange: stat.cumulativeRankChange,
					// 直接寫入計算好的最終排名
					overallRank: newOverallRank,
					previousOverallRank: previousOverallRank,
					overallRankChange: overallRankChange,
				},
			})
		);
	});

	// 5️⃣ [執行] 一次性地、並發地執行所有資料庫寫入操作
	if (upsertPromises.length > 0) {
		await Promise.all(upsertPromises);
	}
}
