"use client";

import React, { useEffect, useState } from "react";
import FilterStage from "./FilterStage";
import SortingStage from "./SortingStage";
import ResultStage from "./ResultStage";
import { AlbumData, RankingSubmissionData, TrackData } from "@/types/data";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";

export type CurrentStage = "filter" | "sorting" | "result";

type SorterPageProps = {
	albums: AlbumData[];
	tracks: TrackData[];
	draft: RankingSubmissionData | null;
	rankingType?: "artist" | "album";
	albumId?: string;
};

export default function SorterPage({ albums, tracks, draft, rankingType = "artist", albumId }: SorterPageProps) {
	const [currentStage, setCurrentStage] = useState<CurrentStage | null>(null);
 
	useEffect(() => {
		const rankingState = draft?.rankingState ? JSON.parse(draft.rankingState as string) : null;
		if (rankingState?.result) setCurrentStage("result");
		else if (draft) setCurrentStage("sorting");
		else setCurrentStage("filter");
	}, [draft]);

	if (currentStage === "filter")
		return (
			<FilterStage
				albums={albums}
				tracks={tracks}
				setCurrentStage={setCurrentStage}
				rankingType={rankingType}
				albumId={albumId}
			/>
		);
	else if (currentStage === "sorting")
		return (
			<SortingStage
				data={tracks}
				draft={draft}
				setCurrentStage={setCurrentStage}
				rankingType={rankingType}
				albumId={albumId}
			/>
		);
	else if (currentStage === "result" && draft)
		return <ResultStage draft={draft} rankingType={rankingType} albumId={albumId} />;
	else return <LoadingAnimation />;
}
