"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import InfoTooltip from "@/components/overlay/InfoTooltip";
import ArtistSelect from "./ArtistSelect";
import ParameterPanel from "./ParameterPanel";
import AlbumScoreQuadBarChart from "./AlbumScoreQuadBarChart";
import {
	calculateAlbumPointsSandbox,
	calculateOneDirectionalAlbumPoints,
	DEFAULT_PARAMS,
} from "../calculateAlbumPoints.sandbox";
import { calculateMaxAlbumPoints } from "../calculateMaxAlbumPoints";
import { calculateTrimmedAlbumPoints } from "../calculateTrimmedAlbumPoints";
import { calculateUnweightedAlbumScore } from "../calculateUnweightedScore";
import { getRawTrackStats } from "../getRawTrackStats";
import { AlbumPointsParams, AlbumScoreResult, LabArtistData } from "../types";

type Props = {
	artists: { id: string; name: string }[];
	initialData: LabArtistData;
	userId: string;
};

type SortKey = "weighted" | "unweighted" | "oneDirectional" | "trimmed";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
	{ value: "weighted", label: "Weighted" },
	{ value: "unweighted", label: "Unweighted" },
	{ value: "oneDirectional", label: "One-directional" },
	{ value: "trimmed", label: "Trimmed" },
];

function toComparisonItems(
	weighted: AlbumScoreResult[],
	unweighted: AlbumScoreResult[],
	oneDirectional: AlbumScoreResult[],
	trimmed: AlbumScoreResult[],
	maxPointsByAlbumId: Map<string, number>,
	albums: LabArtistData["albums"],
	normalizeToMax: boolean,
	sortBy: SortKey
) {
	const albumsById = new Map(albums.map((a) => [a.id, a]));
	const unweightedByAlbumId = new Map(
		unweighted.map((r) => [r.albumId, r.score])
	);
	const oneDirectionalByAlbumId = new Map(
		oneDirectional.map((r) => [r.albumId, r.score])
	);
	const trimmedByAlbumId = new Map(trimmed.map((r) => [r.albumId, r.score]));

	const items = weighted.map((r) => {
		const album = albumsById.get(r.albumId);
		const maxPoints = maxPointsByAlbumId.get(r.albumId) ?? 0;
		const weightedScore = normalizeToMax
			? maxPoints > 0
				? Math.round((1000 * r.score) / maxPoints)
				: 0
			: r.score;
		return {
			id: r.albumId,
			label: album?.name ?? r.albumId,
			color: album?.color ?? null,
			weighted: weightedScore,
			unweighted: unweightedByAlbumId.get(r.albumId) ?? 0,
			oneDirectional: oneDirectionalByAlbumId.get(r.albumId) ?? 0,
			trimmed: trimmedByAlbumId.get(r.albumId) ?? 0,
		};
	});

	return items.sort((a, b) => b[sortBy] - a[sortBy]);
}

export default function AlbumPointsLabClient({
	artists,
	initialData,
	userId,
}: Props) {
	const [data, setData] = useState(initialData);
	const [params, setParams] = useState<AlbumPointsParams>(DEFAULT_PARAMS);
	const [normalizeToMax, setNormalizeToMax] = useState(true);
	const [sortBy, setSortBy] = useState<SortKey>("weighted");
	const [isPending, startTransition] = useTransition();

	const rankInput = useMemo(
		() =>
			data.tracks.map((t) => ({ albumId: t.albumId, rank: t.overallRank })),
		[data.tracks]
	);

	const avgAlbumTrackCount = useMemo(() => {
		const counts = new Map<string, number>();
		for (const t of data.tracks) {
			if (!t.albumId) continue;
			counts.set(t.albumId, (counts.get(t.albumId) ?? 0) + 1);
		}
		if (counts.size === 0) return 0;
		const total = Array.from(counts.values()).reduce((sum, n) => sum + n, 0);
		return total / counts.size;
	}, [data.tracks]);

	const weightedResults = useMemo(
		() => calculateAlbumPointsSandbox(rankInput, params),
		[rankInput, params]
	);
	const unweightedResults = useMemo(
		() => calculateUnweightedAlbumScore(rankInput),
		[rankInput]
	);
	const oneDirectionalResults = useMemo(
		() => calculateOneDirectionalAlbumPoints(rankInput, params),
		[rankInput, params]
	);
	const trimmedResults = useMemo(
		() => calculateTrimmedAlbumPoints(rankInput, params),
		[rankInput, params]
	);
	const maxPointsByAlbumId = useMemo(
		() => calculateMaxAlbumPoints(rankInput, params),
		[rankInput, params]
	);

	const comparisonItems = useMemo(
		() =>
			toComparisonItems(
				weightedResults,
				unweightedResults,
				oneDirectionalResults,
				trimmedResults,
				maxPointsByAlbumId,
				data.albums,
				normalizeToMax,
				sortBy
			),
		[
			weightedResults,
			unweightedResults,
			oneDirectionalResults,
			trimmedResults,
			maxPointsByAlbumId,
			data.albums,
			normalizeToMax,
			sortBy,
		]
	);

	function handleArtistChange(artistId: string) {
		startTransition(async () => {
			const next = await getRawTrackStats(artistId, userId);
			if (next) setData(next);
		});
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Album Points Lab</h1>
					<p className="text-sm text-muted-foreground">
						Live parameter tuning for calculateAlbumPoints — {data.artistName}
						{" · "}
						Avg album length: {avgAlbumTrackCount.toFixed(1)} tracks
					</p>
				</div>
				<ArtistSelect
					artists={artists}
					value={data.artistId}
					onChange={handleArtistChange}
				/>
			</div>

			<ParameterPanel params={params} onChange={setParams} />

			<Card className={isPending ? "opacity-50 transition-opacity" : "transition-opacity"}>
				<CardHeader className="flex-row items-center justify-between gap-2 mb-10 space-y-0">
					<div className="flex items-center gap-2">
						<CardTitle className="text-base">
							Weighted vs. unweighted vs. one-directional vs. trimmed
						</CardTitle>
						<InfoTooltip
							content={
								normalizeToMax
									? "Weighted: average per-track score (percentile^k), shrunk toward the artist's overall average (bidirectional) based on how far this album's track count deviates from the artist's average album length, then normalized to a 1000-point scale using each album's theoretical max score (if its tracks swept ranks 1..k). Unweighted: (totalTrackCount - avgRank + 1) / totalTrackCount * 1000, no penalty. One-directional: same shrinkage as Weighted, but only ever pulls scores down, never up. Trimmed: same as One-directional, but only the top trimPercentile best-ranked tracks in the album count toward the average."
									: "Weighted: raw shrunk average score (0-1000 scale, not normalized to a per-album max). Unweighted: (totalTrackCount - avgRank + 1) / totalTrackCount * 1000, no penalty. One-directional: only pulls scores down toward the artist's average, never up. Trimmed: one-directional penalty applied after keeping only the top trimPercentile best-ranked tracks."
							}
						/>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<Label htmlFor="sort-by" className="text-sm text-muted-foreground">
								Sort by
							</Label>
							<Select
								value={sortBy}
								onValueChange={(value) => setSortBy(value as SortKey)}
							>
								<SelectTrigger id="sort-by" className="w-[160px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SORT_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-2">
							<Label htmlFor="normalize-to-max" className="text-sm text-muted-foreground">
								Normalize to 1000-point max
							</Label>
							<Switch
								id="normalize-to-max"
								checked={normalizeToMax}
								onCheckedChange={setNormalizeToMax}
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="h-[380px]">
						{comparisonItems.length > 0 ? (
							<AlbumScoreQuadBarChart items={comparisonItems} />
						) : (
							<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
								No album data for this artist.
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
