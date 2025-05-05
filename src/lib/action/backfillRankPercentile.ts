"use server"; // 標記為 Server Action

import { db } from "@/lib/prisma"; // 確保路徑正確
import { Prisma } from '@prisma/client';

// 定義輸入參數類型
type BackfillParams = {
    skip: number; // 這次要跳過多少筆記錄
    take: number; // 這次要處理多少筆記錄 (批次大小)
};

// 定義返回結果類型
type BackfillResult = {
    processedCount: number; // 本次實際處理了多少筆
    hasMore: boolean;      // 是否可能還有更多記錄需要處理
    error?: string;        // 如果出錯，返回錯誤訊息
};

// 快取 Session Counts 以避免重複查詢 (簡單內存快取)
let sessionCountsCache: Map<string, number> | null = null;
async function getSessionCountsMap(): Promise<Map<string, number>> {
    // 如果快取存在，直接返回
    if (sessionCountsCache) {
        return sessionCountsCache;
    }
    console.log("首次獲取 Session 計數...");
    const sessionCounts = await db.ranking.groupBy({
        by: ['dateId'],
        // where: { userId: '...', artistId: '...' }, // 如果需要縮小範圍
        _count: { _all: true },
    });
    sessionCountsCache = new Map(sessionCounts.map(s => [s.dateId, s._count._all]));
    console.log(`獲取並快取了 ${sessionCountsCache.size} 個 Session 的計數。`);
    return sessionCountsCache;
}

// Server Action 函數
export async function backfillRankPercentileBatch({ skip, take }: BackfillParams): Promise<BackfillResult> {
    console.log(`處理批次：跳過 ${skip} 筆，獲取 ${take} 筆`);
    try {
        const countsMap = await getSessionCountsMap();

        // 1. 獲取當前批次需要更新的 Ranking 記錄
        const rankingsToUpdate = await db.ranking.findMany({
            where: {
                //rankPercentile: null, // 只找還沒處理過的
                // 可能需要加上 userId, artistId 等其他條件
            },
            select: {
                id: true,
                ranking: true,
                dateId: true,
            },
            orderBy: {
                id: 'asc', // 必須有穩定排序，以便 skip 生效
            },
            skip: skip, // 跳過已處理的記錄
            take: take, // 只獲取當前批次大小的記錄
        });

        // 如果找不到更多需要更新的記錄，表示完成了
        if (rankingsToUpdate.length === 0) {
            console.log("在此批次中找不到更多需要更新的記錄，可能已完成。");
            sessionCountsCache = null; // 清除快取
            return { processedCount: 0, hasMore: false };
        }

        // 2. 準備更新操作
        const updatePromises: Prisma.PrismaPromise<any>[] = [];
        for (const ranking of rankingsToUpdate) {
            const N = countsMap.get(ranking.dateId);
            if (N && N > 0) {
                const percentile = ranking.ranking / N;
                updatePromises.push(
                    db.ranking.update({
                        where: { id: ranking.id },
                        data: { rankPercentile: percentile },
                        select: { id: true } // 只 select id 可以稍微減少返回數據量
                    })
                );
            } else {
                console.warn(`Session ${ranking.dateId} for ranking ${ranking.id} has count ${N}, skipping.`);
            }
        }

        // 3. 執行批量更新事務
        let actualProcessedCount = 0;
        if (updatePromises.length > 0) {
            const results = await db.$transaction(updatePromises);
            actualProcessedCount = results.length;
            console.log(` -> 成功更新 ${actualProcessedCount} 筆記錄。`);
        } else {
            console.log(" -> 此批次中無有效數據可更新。");
        }

        // 4. 判斷是否還有更多數據
        // 如果這次獲取的數量等於請求的數量(take)，則很可能還有更多
        const hasMore = rankingsToUpdate.length === take;
        if (!hasMore) {
             sessionCountsCache = null; // 如果沒有更多了，清除計數快取
             console.log("已處理完所有批次。")
        }

        return { processedCount: actualProcessedCount, hasMore: hasMore };

    } catch (error: any) {
        console.error("回填批次時發生錯誤:", error);
        sessionCountsCache = null; // 出錯時也清除快取
        return { processedCount: 0, hasMore: false, error: error.message || "發生未知錯誤" };
    }
}