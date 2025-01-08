import SortingStage from "@/components/sorter/SorterResult";
import getTracksByArtist from "@/lib/database/data/getTracksByArtist";
import getRankingDraft from "@/lib/database/user/getRankingDraft";
import React from "react";
import { getUserSession } from "@/../auth";
import SorterField from "@/components/sorter/SorterField";

export default async function SorterPage({
	params,
}: {
	params: Promise<{ artistId: string }>;
}) {
	const { id: userId } = await getUserSession();
	const artistId = (await params).artistId;
	const tracks = await getTracksByArtist(artistId);

	const draft = await getRankingDraft({ artistId, userId });

	return (
		<SorterField datas={tracks} draft={draft} />
	);
}
