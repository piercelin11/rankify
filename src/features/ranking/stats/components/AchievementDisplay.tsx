import {
	ArrowDownIcon,
	ArrowUpIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import React from "react";

export type AchievementType = "New Peak" | "Big Jump" | "Big Drop" | null;

type AchievementDisplayProps = {
	achievement?: AchievementType | null;
};

export default function AchievementDisplay({
	achievement,
}: AchievementDisplayProps) {
	function getAchievement() {
		if (achievement === "New Peak")
			return (
				<div className="flex items-center gap-2 rounded-md border border-lime-500 p-3 text-sm text-lime-500">
					<StarFilledIcon />
					<p>New Peak</p>
				</div>
			);
		else if (achievement === "Big Jump")
			return (
				<div className="flex items-center gap-2 rounded-md border border-green-500 p-3 text-sm text-green-500">
					<ArrowUpIcon />
					<p>Big Jump</p>
				</div>
			);
		if (achievement === "Big Drop")
			return (
				<div className="flex items-center gap-2 rounded-md border border-red-500 p-3 text-sm text-red-500">
					<ArrowDownIcon />
					<p>Big Drop</p>
				</div>
			);
	}

	return <>{getAchievement()}</>;
}
