import React from "react";

import SorterResult from "@/components/sorter/SorterResult";
import getRankingDraft from "@/lib/database/user/getRankingDraft";
import { getUserSession } from "@/../auth";
import { redirect } from "next/navigation";

export default async function SorterResultPage({
	params,
}: {
	params: Promise<{ artistId: string }>;
}) {
	const { id: userId } = await getUserSession();
	const artistId = (await params).artistId;
	const draft = await getRankingDraft({ artistId, userId });

	if (!draft) {
		redirect(`/sorter/${artistId}/overview`);
	}

	return (
		<div className="flex items-center justify-center py-32">
			<div className="flex-auto">
				<SorterResult draft={draft} />
			</div>
		</div>
	);
}
