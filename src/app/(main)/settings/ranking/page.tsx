import React from "react";
import { Description } from "@/components/ui/Text";
import RankingSettings from "@/components/settings/RankingSettings";
import { getUserSession } from "../../../../../auth";
import getUserPreference from "@/lib/database/user/getUserPreference";

export default async function RankingSettingsPage() {
	const {id: userId} = await getUserSession();

	const userPreference = await getUserPreference({userId});
	
	return (
		<div className="space-y-14">
			<div className="space-y-2">
				<h2>Ranking Settings</h2>
				<Description>
					Configure how rankings are calculated and displayed. Customize ranking
					algorithms, display preferences, and other related settings to suit
					your needs.
				</Description>
			</div>

			<RankingSettings settings={userPreference} />
		</div>
	);
}
