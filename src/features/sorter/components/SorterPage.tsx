"use client";

import React, { useEffect, useState } from "react";
import FilterStage from "./FilterStage";
import SortingStage from "./SortingStage";
import ResultStage from "./ResultStage";
import { AlbumData, RankingDraftData, TrackData } from "@/types/data";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";

export type CurrentStage = "filter" | "sorting" | "result";

type SorterPageProps = {
	albums: AlbumData[];
	tracks: TrackData[];
	draft: RankingDraftData | null;
};

export default function SorterPage({ albums, tracks, draft }: SorterPageProps) {
	const [currentStage, setCurrentStage] = useState<CurrentStage | null>(null);
 
	useEffect(() => {
		if (draft?.result) setCurrentStage("result");
		else if (draft) setCurrentStage("sorting");
		else setCurrentStage("filter");
	}, [draft]);

	if (currentStage === "filter")
		return (
			<FilterStage
				albums={albums}
				tracks={tracks}
				setCurrentStage={setCurrentStage}
			/>
		);
	else if (currentStage === "sorting")
		return (
			<SortingStage
				data={tracks}
				draft={draft}
				setCurrentStage={setCurrentStage}
			/>
		);
	else if (currentStage === "result" && draft?.result)
		return <ResultStage draft={draft} />;
	else return <LoadingAnimation />;
}
