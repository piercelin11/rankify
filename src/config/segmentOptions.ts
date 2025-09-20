import { SegmentOption } from "@/components/navigation/SimpleSegmentControl";

export const VIEW_SEGMENT_OPTIONS = [
	{
		label: "Ranking List",
		value: "list",
		queryParam: ["view", "list"] as [string, string],
	},
	{
		label: "Stats Charts",
		value: "charts",
		queryParam: ["view", "charts"] as [string, string],
	},
];

export const TRACK_SEGMENT_OPTIONS: SegmentOption[] = [
	{
		label: "In Artist Rankings",
		value: "artist",
		queryParam: ["type", "artist"],
	},
	{
		label: "In Album Rankings",
		value: "album",
		queryParam: ["type", "album"],
	},
];

export const ALBUM_SEGMENT_OPTIONS: SegmentOption[] = [
	{
		label: "In Artist Rankings",
		value: "artist",
		queryParam: ["type", "artist"],
	},
	{
		label: "In Album Rankings",
		value: "album",
		queryParam: ["type", "album"],
	},
];
