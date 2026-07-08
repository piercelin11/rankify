import PointsBarChart from "@/components/charts/PointsBarChart";
import InfoTooltip from "@/components/overlay/InfoTooltip";
import type { AlbumStatsType } from "@/types/album";

type Props = {
	albumStats: AlbumStatsType[];
	title?: string;
};

export default function AlbumPointsCard({
	albumStats,
	title = "Album Points",
}: Props) {
	if (albumStats.length === 0) return null;

	const sortedByReleaseDate = [...albumStats].sort(
		(a, b) => a.releaseDate.getTime() - b.releaseDate.getTime()
	);

	return (
		<div>
			<div className="mb-20 flex items-center gap-2">
				<h2>{title}</h2>
				<InfoTooltip content="Average points earned by each album across your ranking submissions." />
			</div>
			<div className="h-[280px] xl:h-[380px] 2xl:h-[420px]">
				<PointsBarChart
					items={sortedByReleaseDate.map((album) => ({
						id: album.id,
						label: album.name,
						value: album.avgPoints,
						color: album.color,
					}))}
				/>
			</div>
		</div>
	);
}
