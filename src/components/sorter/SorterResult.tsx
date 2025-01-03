"use client";

import { RankingDraftData } from "@/types/data";
import React from "react";
import { RankingResultData } from "./SorterField";
import SorterResultListItem from "./SorterResultListItem";
import Button from "../ui/Button";
import submitRanking from "@/lib/action/user/submitRanking";
import { notFound } from "next/navigation";
import deleteRankingDraft from "@/lib/action/user/deleteRankingDraft";

type SorterResultProps = {
	draft: RankingDraftData;
};

export default function SorterResult({ draft }: SorterResultProps) {
	if (!draft.result) notFound();

	const result = JSON.parse(draft.result) as RankingResultData[];

	return (
		<div className="space-y-10">
			<div>
				{result.map((data) => (
					<SorterResultListItem key={data.id} data={data} />
				))}
			</div>
			<div className="flex gap-5 [&_button]:w-40">
				<Button
					className="py-5"
					variant="lime"
					onClick={() => {
						submitRanking(result, "ARTIST");
					}}
				>
					<p className="w-full">Submit</p>
				</Button>
				<Button
					className="py-5"
					variant="gray"
					onClick={() => {
						deleteRankingDraft(result[0].artistId, `/artist/${result[0].artistId}/overview`);
					}}
				>
					<p className="w-full">Quit</p>
				</Button>
			</div>
		</div>
	);
}
