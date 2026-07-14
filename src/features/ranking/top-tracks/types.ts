/**
 * TopTracksCard 的通用最小介面
 * TrackStatsType（overview）與 TrackHistoryType（snapshot）皆結構相容，可直接傳入
 */
export type TopTracksItem = {
	id: string;
	name: string;
	artistId: string;
	img: string | null;
	/** 顯示序號 */
	rank: number;
	album: { name: string | null } | null;
	/** TrackStatsType 專屬 */
	highestRank?: number;
	/** TrackHistoryType 專屬 */
	peak?: number;
};
