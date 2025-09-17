import { SegmentOption } from "@/components/navigation/SimpleSegmentControl";

export const OVERVIEW_SEGMENT_OPTIONS: SegmentOption[] = [
	{
		label: "My Overview",
		value: "my-overview",
		queryParam: ["scope", "global"],
	},
	{
		label: "Global Overview",
		value: "global-overview",
		queryParam: ["scope", "personal"],
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
