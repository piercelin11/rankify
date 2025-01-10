import getTracksStats, {
	TimeFilterType,
	TrackStatsType,
} from "./getTracksStats";
import { AlbumData } from "@/types/data";
import getLoggedAlbum from "../../user/getLoggedAlbums";
import { getPastDateProps } from "@/lib/utils/helper";
import getUserPreference from "../../user/getUserPreference";
import { defaultRankingSettings } from "@/components/settings/RankingSettings";
import { RankingSettingsType } from "@/types/schemas/settings";
import { TrackHistoryType } from "../history/getTracksRankingHistory";
import getRankingSession from "../../user/getRankingSession";
import {
	AlbumHistoryType,
	getAlbumsRankingHistory,
} from "../history/getAlbumsRankingHistory";

export type AlbumStatsType = AlbumData & {
	ranking: number;
	top3Count: number;
	top10Count: number;
	top1Count: number;
	top5PercentCount: number;
	top25PercentCount: number;
	top50PercentCount: number;
	totalPoints: number;
	rawTotalPoints: number;
	rankings: AlbumHistoryType[];
};

type getAlbumsStatsProps = {
	artistId: string;
	userId: string;
	time?: TimeFilterType;
};

export async function getAlbumsStats({
	artistId,
	userId,
	time,
}: getAlbumsStatsProps): Promise<AlbumStatsType[]> {
	const rankingSettings =
		(await getUserPreference({ userId }))?.rankingSettings ||
		defaultRankingSettings;

	const trackRankings = getFilteredTrackData(
		await getTracksStats({
			artistId,
			userId,
			time,
		}),
		rankingSettings
	);
	const albums = getFilteredAlbumData(
		await getLoggedAlbum({ artistId, userId, time }),
		rankingSettings
	);
	const sessions = await getRankingSession({ artistId, userId });
	const allAlbumsRankingHistory = (
		await Promise.all(
			sessions.map((session) =>
				getAlbumsRankingHistory({ artistId, userId, dateId: session.id })
			)
		)
	)
		.flat()
		.sort((a, b) => a.date.getTime() - b.date.getTime());
	const countSongs = trackRankings.length;

	// 計算專輯的平均排名
	const albumRankings = trackRankings
		.filter((item) => item.albumId)
		.reduce((acc: Omit<AlbumStatsType, "ranking">[], cur) => {
			const existingAlbum = acc.find((item) => item.id === cur.albumId);
			const albumData = albums.find((item) => item.id === cur.albumId)!;

			const { adjustedScore, rawScore } = calculateAlbumPoints(
				cur.ranking,
				countSongs,
				albumData!.tracks!.length,
				albums.length
			);

			if (existingAlbum) {
				existingAlbum.top3Count += cur.top3Count;
				existingAlbum.top10Count += cur.top10Count;
				existingAlbum.top1Count += cur.top1Count;
				existingAlbum.rawTotalPoints += rawScore;
				existingAlbum.totalPoints += adjustedScore;

				if (cur.ranking <= countSongs / 4) existingAlbum.top25PercentCount++;
				if (cur.ranking <= countSongs / 2) existingAlbum.top50PercentCount++;
			} else {
				acc.push({
					...albumData,
					top5PercentCount: cur.ranking <= countSongs / 20 ? 1 : 0,
					top25PercentCount: cur.ranking <= countSongs / 4 ? 1 : 0,
					top50PercentCount: cur.ranking <= countSongs / 2 ? 1 : 0,
					top3Count: cur.top3Count,
					top10Count: cur.top10Count,
					top1Count: cur.top1Count,
					totalPoints: adjustedScore,
					rawTotalPoints: rawScore,
					rankings: allAlbumsRankingHistory.filter(
						(album) => album.id === cur.albumId
					),
				});
			}

			return acc;
		}, []);

	return albumRankings
		.sort((a, b) => b.totalPoints - a.totalPoints)
		.map((ranking, index) => ({ ...ranking, ranking: index + 1 }));
}

export function calculateAlbumPoints(
	ranking: number,
	countSongs: number,
	countAlbumsSongs: number,
	countAlbums: number
) {
	// 計算百分比排名
	const percentileRank = (countSongs - ranking + 1) / countSongs;
	// 計算分數
	let score =
		percentileRank > 0.5 ? percentileRank * 900 : percentileRank * 600;
	// 引入平滑係數：若專輯數小於5首且歌曲排名在前百分之五十，則引入平滑係數
	const smoothingFactor =
		percentileRank > 0.5 && countAlbumsSongs < 5
			? countAlbumsSongs * 0.15 + 0.25
			: 1;
	// 調整分數
	const adjustedScore = Math.floor(
		(score / countAlbumsSongs) * smoothingFactor
	);

	const rawScore = Math.floor(score / (countSongs / countAlbums));

	return { adjustedScore, rawScore };
}

export function getFilteredTrackData<
	T extends TrackStatsType | TrackHistoryType,
>(data: T[], settings: RankingSettingsType): T[] {
	let tracks = data;
	if (!settings.includeInterlude)
		tracks = tracks.filter(
			(track) => !track.name.toLowerCase().includes("interlude")
		);
	if (!settings.includeIntroOutro)
		tracks = tracks.filter(
			(track) =>
				!track.name.toLowerCase().includes("intro") &&
				!track.name.toLowerCase().includes("outro")
		);
	return tracks;
}

export function getFilteredAlbumData(
	data: AlbumData[],
	settings: RankingSettingsType
) {
	let albums = data;
	if (!settings.includeInterlude)
		albums = albums.map((album) => ({
			...album,
			tracks: album.tracks?.filter(
				(track) => !track.name.toLowerCase().includes("interlude")
			),
		}));
	if (!settings.includeIntroOutro)
		albums = albums.map((album) => ({
			...album,
			tracks: album.tracks?.filter(
				(track) =>
					!track.name.toLowerCase().includes("outro") &&
					!track.name.toLowerCase().includes("intro")
			),
		}));
	return albums;
}
