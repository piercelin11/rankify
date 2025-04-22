import React from "react";
import { getUserSession } from "../../../../../auth";
import getUserPreference from "@/lib/database/user/getUserPreference";
import RankingSettings from "@/features/settings/RankingSettings";

export default async function RankingSettingsPage() {
	const {id: userId} = await getUserSession();

	const userPreference = await getUserPreference({userId});
	
	return (
		<div className="space-y-14">
			<div className="space-y-2">
				<h2>Ranking Settings</h2>
				<p className="text-description">
					Configure how rankings are calculated and displayed. Customize ranking
					algorithms, display preferences, and other related settings to suit
					your needs.
				</p>
			</div>

			<RankingSettings settings={userPreference} />
		</div>
	);
}
