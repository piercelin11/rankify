// TEMPORARY(sandbox): renders experimental scores computed on read (see
// getSandboxAlbumAverages.ts / getAlbumScoreHistory.ts). Remove once a formula
// is finalized and backfilled — the official AlbumPointsCard should carry it.
import PointsBarChart from "@/components/charts/PointsBarChart";
import InfoTooltip from "@/components/overlay/InfoTooltip";
import { AlbumScoreStats } from "../getAlbumScoreHistory";
import { SandboxAlbumAverage } from "../getSandboxAlbumAverages";

type Props = {
	averages: SandboxAlbumAverage[];
	history: AlbumScoreStats[];
	title: string;
};

export default function SandboxAlbumPointsCard({
	averages,
	history,
	title,
}: Props) {
	if (averages.length === 0) return null;

	const historyByAlbumId = new Map(history.map((h) => [h.albumId, h]));
	const sortedByReleaseDate = [...averages].sort(
		(a, b) => a.releaseDate.getTime() - b.releaseDate.getTime()
	);

	return (
		<div>
			<div className="mb-20 flex items-center gap-2">
				<h2>{title}</h2>
				<InfoTooltip content="Experimental score, computed on read from current ranking data. Not yet the official score." />
			</div>
			<div className="h-[280px] xl:h-[380px] 2xl:h-[420px]">
				<PointsBarChart
					items={sortedByReleaseDate.map((album) => ({
						id: album.albumId,
						label: album.name,
						value: album.score,
						color: album.color,
					}))}
				/>
			</div>
			<ul className="mt-4 space-y-1 text-sm text-muted-foreground">
				{sortedByReleaseDate.map((album) => {
					const stats = historyByAlbumId.get(album.albumId);
					return (
						<li key={album.albumId} className="flex justify-between gap-4">
							<span>{album.name}</span>
							<span>
								Peak {stats?.peak ?? "—"} · Submissions{" "}
								{stats?.submissionCount ?? 0} ·{" "}
								{stats?.changeFromPrevious != null
									? `${(stats.changeFromPrevious * 100).toFixed(1)}%`
									: "—"}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
