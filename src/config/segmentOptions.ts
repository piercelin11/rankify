import { SegmentOption } from "@/components/navigation/SimpleSegmentControl";

export const VIEW_SEGMENT_OPTIONS: SegmentOption[] = [
	{
		label: "Ranking List",
		value: "list",
		href: "?view=list",
	},
	{
		label: "Stats Charts",
		value: "charts",
		href: "?view=charts",
	},
];

export const TRACK_SEGMENT_OPTIONS: SegmentOption[] = [
	{
		label: "In Artist Rankings",
		value: "artist",
		href: "?type=artist",
	},
	{
		label: "In Album Rankings",
		value: "album",
		href: "?type=album",
	},
];

export const ALBUM_SEGMENT_OPTIONS: SegmentOption[] = [
	{
		label: "In Artist Rankings",
		value: "artist",
		href: "?type=artist",
	},
	{
		label: "In Album Rankings",
		value: "album",
		href: "?type=album",
	},
];
