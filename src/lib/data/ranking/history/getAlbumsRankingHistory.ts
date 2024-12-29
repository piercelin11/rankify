import { AlbumData, ArtistData, TrackData } from "@/types/data";
import {
	getTracksRankingHistory,
	TrackHistoryType,
} from "./getTracksRankingHistory";
import getPrevRankingSession from "../../user/getPrevRankingSession";
import getLoggedAlbum from "../../user/getLoggedAlbums";
import { db } from "@/lib/prisma";
import { calculateAlbumPoints } from "../overview/getAlbumsStats";

export type AlbumHistoryType = AlbumData & {
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
	let prevTrackRankings: null | TrackHistoryType[];
	let countPrevSongs: null | number;

	const trackRankings = await getTracksRankingHistory({
		artistId,
		dateId,
		userId,
	});
	const countSongs = trackRankings.length;
	const prevSession = await getPrevRankingSession({ artistId, dateId, userId });
	if (prevSession)
		prevTrackRankings = await getTracksRankingHistory({
			artistId,
			dateId: prevSession.id,
			userId,
		});
	if (prevSession) countPrevSongs = prevSession.rankings.length;

	// 計算當前與前次每個專輯中的歌曲數量
	const albums = await getLoggedAlbum({ artistId, userId });
	const prevAlbums = await db.album.findMany({
		where: {
			artistId,
			tracks: {
				some: {
					rankings: {
						some: {
							userId,
						},
					},
				},
			},
		},
		include: {
			tracks: {
				where: {
					rankings: {
						some: {
							userId,
							date: {
								date: prevSession?.date,
							},
						},
					},
				},
			},
			artist: true,
		},
	});

	// 結果
	const result = trackRankings
		.filter((item) => item.albumId !== null)
		.reduce((acc: Omit<AlbumHistoryType, "pointsChange">[], cur) => {
			const existingAlbum = acc.find((item) => item.id === cur.albumId);
			const albumData = albums.find(
				(item) => item.id === cur.albumId
			) as AlbumData & { artist: ArtistData; tracks: TrackData[] };
			const prevAlbumData = prevAlbums.find((item) => item.id === cur.albumId);

			// 計算當前百分比排名
			const { score, adjustedScore } = calculateAlbumPoints(
				cur.ranking,
				countSongs,
				albumData.tracks.length
			);
			const rawScore = Math.floor(score! / (countSongs / albums.length));

			const prevRanking = prevSession?.rankings?.find(
				(ranking) => ranking.trackId === cur.id
			)?.ranking;

			// 計算之前百分比排名
			const { adjustedScore: prevAdjustedScore } = calculateAlbumPoints(
				prevRanking || 0,
				countPrevSongs || 0,
				prevAlbumData?.tracks.length || 0
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
					top25PercentCount: cur.ranking <= countSongs / 4 ? 1 : 0,
					top50PercentCount: cur.ranking <= countSongs / 2 ? 1 : 0,
					totalPoints: adjustedScore,
					previousTotalPoints: prevRanking ? prevAdjustedScore : 0,
					rawTotalPoints: rawScore,
				});
			}
			return acc;
		}, []);

	return result
		.sort((a, b) => b.totalPoints - a.totalPoints)
		.map((item) => ({
			...item,
			pointsChange: item.previousTotalPoints ? item.totalPoints - item.previousTotalPoints : null,
		}));
}
