import { AlbumData, ArtistData, TrackData } from "@/types/data";
import {
	getTracksRankingHistory,
	TrackHistoryType,
} from "./getTracksRankingHistory";
import getLoggedAlbums from "../../user/getLoggedAlbums";
import {
	calculateAlbumPoints,
	getFilteredAlbumData,
	getFilteredTrackData,
} from "../overview/getAlbumsStats";
import getUserPreference from "../../user/getUserPreference";
import { defaultRankingSettings } from "@/components/settings/RankingSettings";
import getRankingSession from "../../user/getRankingSession";

export type AlbumHistoryType = AlbumData & {
	dateId: string;
	date: Date;
	ranking: number;
	top25PercentCount: number;
	top50PercentCount: number;
	totalPoints: number;
	previousTotalPoints: number;
	pointsChange: number | null;
	rawTotalPoints: number;
	releaseDate: Date | null;
};

type getAlbumsRankingHistoryProps = {
	artistId: string;
	userId: string;
	dateId: string;
};

export async function getAlbumsRankingHistory({
	artistId,
	dateId,
	userId,
}: getAlbumsRankingHistoryProps): Promise<AlbumHistoryType[]> {
	const rankingSettings =
		(await getUserPreference({ userId }))?.rankingSettings ||
		defaultRankingSettings;

	let prevTrackRankings: null | TrackHistoryType[] = null;
	let countPrevSongs: null | number = null;
	const originalTrackRankings = await getTracksRankingHistory({
		artistId,
		dateId,
		userId,
	});
	const trackRankings = getFilteredTrackData(
		originalTrackRankings,
		rankingSettings
	);
	const countSongs = originalTrackRankings.length;
	const sessions = await getRankingSession({ artistId, userId });
	const prevSession = (
		await getRankingSession({
			artistId,
			userId,
			time: {
				threshold: sessions.find((session) => session.id === dateId)!.date,
				filter: "lt",
			},
		})
	)?.[0];

	if (prevSession) {
		const originalPrevTrackRankings = await getTracksRankingHistory({
			artistId,
			dateId: prevSession.id,
			userId,
		});
		prevTrackRankings = getFilteredTrackData(
			originalPrevTrackRankings,
			rankingSettings
		);
		countPrevSongs = originalPrevTrackRankings.length;
	}

	// 計算當前與前次每個專輯中的歌曲數量
	const albums = getFilteredAlbumData(
		await getLoggedAlbums({
			artistId,
			userId,
			time: {
				threshold: sessions.find((session) => session.id === dateId)?.date,
				filter: "equals",
			},
		}),
		rankingSettings
	);
	const prevAlbums = getFilteredAlbumData(
		await getLoggedAlbums({
			artistId,
			userId,
			time: { threshold: prevSession?.date, filter: "equals" },
		}),
		rankingSettings
	);

	const result = trackRankings
		.filter((item) => item.albumId !== null)
		.reduce(
			(acc: Omit<AlbumHistoryType, "pointsChange" | "ranking">[], cur) => {
				const existingAlbum = acc.find((item) => item.id === cur.albumId);
				const albumData = albums.find(
					(item) => item.id === cur.albumId
				) as AlbumData & { artist: ArtistData; tracks: TrackData[] };
				const prevAlbumData = prevAlbums.find(
					(item) => item.id === cur.albumId
				);

				// 計算當前百分比排名
				const { adjustedScore, rawScore } = calculateAlbumPoints(
					cur.ranking,
					countSongs,
					albumData.tracks.length,
					albums.length
				);

				const prevRanking = prevSession?.rankings?.find(
					(ranking) => ranking.trackId === cur.id
				)?.ranking;

				// 計算之前百分比排名
				const { adjustedScore: prevAdjustedScore } = calculateAlbumPoints(
					prevRanking || 0,
					countPrevSongs || 0,
					prevAlbumData?.tracks!.length || 0,
					prevAlbums.length
				);

				if (existingAlbum) {
					if (cur.ranking <= countSongs / 4) existingAlbum.top25PercentCount++;
					if (cur.ranking <= countSongs / 2) existingAlbum.top50PercentCount++;

					existingAlbum.previousTotalPoints += prevRanking
						? prevAdjustedScore
						: 0;
					existingAlbum.rawTotalPoints += rawScore;
					existingAlbum.totalPoints += adjustedScore;
				} else {
					acc.push({
						...albumData,
						dateId,
						date: sessions.find((session) => session.id === dateId)!.date,
						top25PercentCount: cur.ranking <= countSongs / 4 ? 1 : 0,
						top50PercentCount: cur.ranking <= countSongs / 2 ? 1 : 0,
						totalPoints: adjustedScore,
						previousTotalPoints: prevRanking ? prevAdjustedScore : 0,
						rawTotalPoints: rawScore,
					});
				}
				return acc;
			},
			[]
		);

	return result
		.sort((a, b) => b.totalPoints - a.totalPoints)
		.map((item, index) => ({
			...item,
			ranking: index + 1,
			pointsChange: item.previousTotalPoints
				? item.totalPoints - item.previousTotalPoints
				: null,
		}));
}
