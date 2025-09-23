// 例如放在: src/features/ranking/data/getStreakAchievements.ts
import { db } from "@/db/client";
import { Prisma } from "@prisma/client";

type StreakResult = {
	trackId: string;
};

// 函數參數需要包含所有必要的篩選條件
type GetStreakProps = {
	userId: string;
	artistId: string;
	streak?: 3 | 5;
};

// 計算 "Ascent" (連續上漲 >= 3 次，結算至最新一次)
export async function getTracksWithColdStreak({
	userId,
	artistId,
	streak = 3,
}: GetStreakProps): Promise<Set<string>> {
	// 返回一個包含 Track ID 的 Set

	const parameters: string[] = [userId, artistId];

	let query: Prisma.Sql;

	if (streak === 3)
		query = Prisma.sql`
        WITH LaggedRankings AS (
            SELECT
                r."trackId",
                r.rank,
                s."createdAt", -- 用於排序
                -- 獲取上一次排名 (按日期升序，所以 lag(1) 是上一筆)
                LAG(r.rank, 1) OVER (PARTITION BY r."trackId" ORDER BY s."createdAt" ASC) as prev_ranking_1,
                -- 獲取上上次排名
                LAG(r.rank, 2) OVER (PARTITION BY r."trackId" ORDER BY s."createdAt" ASC) as prev_ranking_2,
                -- 獲取上上次排名
                LAG(r.rank, 3) OVER (PARTITION BY r."trackId" ORDER BY s."createdAt" ASC) as prev_ranking_3,
                -- 標識每個 track 的最新記錄 (按日期降序，最新的是 1)
                ROW_NUMBER() OVER (PARTITION BY r."trackId" ORDER BY s."createdAt" DESC) as rn
            FROM "TrackRanking" r
            INNER JOIN "RankingSubmission" s ON r."submissionId" = s.id -- 需要 JOIN Submission 來獲取日期
            WHERE r."userId" = ${userId} AND r."artistId" = ${artistId} AND s.status = 'COMPLETED' -- 應用篩選條件
        )
        SELECT
            lr."trackId"
        FROM LaggedRankings lr
        WHERE lr.rn = 1 -- 只關心每個 track 的最新一筆記錄
          AND lr.rank IS NOT NULL       -- 確保排名有效
          AND lr.prev_ranking_1 IS NOT NULL
          AND lr.prev_ranking_2 IS NOT NULL
          AND lr.rank > lr.prev_ranking_1  -- 本次排名優於上次
          AND lr.prev_ranking_1 > lr.prev_ranking_2  -- 上次排名優於上上次
          AND lr.prev_ranking_2 > lr.prev_ranking_3; -- 上上次排名優於上上上次
    `;
	else
		query = Prisma.sql`
    WITH LaggedRankings AS (
        SELECT
            r."trackId",
            r.rank,
            s."createdAt",
            LAG(r.rank, 1) OVER (PARTITION BY r."trackId" ORDER BY s."createdAt" ASC) as prev_ranking_1,
            LAG(r.rank, 2) OVER (PARTITION BY r."trackId" ORDER BY s."createdAt" ASC) as prev_ranking_2,
            LAG(r.rank, 3) OVER (PARTITION BY r."trackId" ORDER BY s."createdAt" ASC) as prev_ranking_3,
            LAG(r.rank, 4) OVER (PARTITION BY r."trackId" ORDER BY s."createdAt" ASC) as prev_ranking_4,
            LAG(r.rank, 5) OVER (PARTITION BY r."trackId" ORDER BY s."createdAt" ASC) as prev_ranking_5,
            ROW_NUMBER() OVER (PARTITION BY r."trackId" ORDER BY s."createdAt" DESC) as rn
        FROM "TrackRanking" r
        INNER JOIN "RankingSubmission" s ON r."submissionId" = s.id -- 需要 JOIN Submission 來獲取日期
        WHERE r."userId" = ${userId} AND r."artistId" = ${artistId} AND s.status = 'COMPLETED' -- 應用篩選條件
    )
    SELECT
        lr."trackId"
    FROM LaggedRankings lr
    WHERE lr.rn = 1 -- 只關心每個 track 的最新一筆記錄
      AND lr.rank IS NOT NULL       -- 確保排名有效
      AND lr.prev_ranking_1 IS NOT NULL
      AND lr.prev_ranking_2 IS NOT NULL
      AND lr.rank > lr.prev_ranking_1
      AND lr.prev_ranking_1 > lr.prev_ranking_2
      AND lr.prev_ranking_2 > lr.prev_ranking_3
      AND lr.prev_ranking_3 > lr.prev_ranking_4
      AND lr.prev_ranking_4 > lr.prev_ranking_5; 
`;

	try {
		const results = await db.$queryRaw<StreakResult[]>(query, ...parameters);
		return new Set(results.map((r) => r.trackId)); // 返回包含 Track ID 的 Set
	} catch (error) {
		console.error("獲取 Cold Streaks 時發生錯誤:", error);
		return new Set<string>(); // 出錯時返回空 Set
	}
}
