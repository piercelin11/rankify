import PointsBarChart from "@/components/charts/PointsBarChart";
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

	return (
		<div>
			<h2 className="mb-4">{title}</h2>
			<div className="h-[280px] xl:h-[380px] 2xl:h-[420px]">
				<PointsBarChart
					items={albumStats.map((album) => ({
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
