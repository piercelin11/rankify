import getTracksStats from "./getTracksStats";
import { AlbumData, ArtistData, TrackData } from "@/types/data";
import getLoggedAlbum from "../../user/getLoggedAlbums";
import { getPastDateProps } from "@/lib/utils/helper";

export type AlbumStatsType = AlbumData & {
	top3Count: number;
	top10Count: number;
	top1Count: number;
	top25PercentCount: number;
	top50PercentCount: number;
	totalPoints: number;
	rawTotalPoints: number;
};

type getAlbumsStatsProps = {
	artistId: string;
	userId: string;
	time?: getPastDateProps;
};

export async function getAlbumsStats({
	artistId,
	userId,
	time,
}: getAlbumsStatsProps): Promise<AlbumStatsType[]> {
	const trackRankings = await getTracksStats({artistId, userId, time});
	const countSongs = trackRankings.length;
	const albums = await getLoggedAlbum({artistId, userId, time});


	// 計算專輯的平均排名
	const albumRankings = trackRankings
		.filter((item) => item.albumId)
		.reduce((acc: any[], cur) => {
			const existingAlbum = acc.find((item) => item.id === cur.albumId);
			const albumData = albums.find((item) => item.id === cur.albumId);

			const { score, adjustedScore } = calculateAlbumPoints(
				cur.ranking,
				countSongs,
				albumData!.tracks.length
			);

			const rawScore = Math.floor(score! / (countSongs / albums.length));

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
					top25PercentCount: cur.ranking <= countSongs / 4 ? 1 : 0,
					top50PercentCount: cur.ranking <= countSongs / 2 ? 1 : 0,
					top3Count: cur.top3Count,
					top10Count: cur.top10Count,
					top1Count: cur.top1Count,
					totalPoints: adjustedScore,
					rawTotalPoints: rawScore,
				});
			}

			return acc;
		}, []);

	return albumRankings.sort((a, b) => b.totalPoints - a.totalPoints);
}

export function calculateAlbumPoints(
	ranking: number,
	countSongs: number,
	countAlbumsSongs: number
) {
	// 計算百分比排名
	const percentileRank = (countSongs - ranking + 1) / countSongs;
	// 計算分數
	let score =
		percentileRank > 0.5 ? percentileRank * 1000 : percentileRank * 500;
	// 引入平滑係數：若專輯數小於5首且平均排名在前百分之二十五，則引入平滑係數
	const smoothingFactor =
		percentileRank > 0.5 && countAlbumsSongs < 5 ? 0.7 : 1;
	// 調整分數
	const adjustedScore = Math.floor(
		(score / countAlbumsSongs) * smoothingFactor
	);

	return { score, adjustedScore };
}
