import { cn } from "@/lib/cn";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CircleBackslashIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import { FaFireAlt, FaSnowflake, FaFire } from "react-icons/fa";
import { IoSnowOutline } from "react-icons/io5";
import React from "react";
import Tooltip from "@/components/overlay/Tooltip";

export type AchievementType =
	| "Hit Peak"
	| "New Low"
	| "Big Jump"
	| "Big Drop"
	| "Hot Streak"
	| "Cold Streak"
	| "Burning Streak"
	| "Freezing Streak";

type AchievementDisplayProps = {
	achievements?: AchievementType[] | null;
};

const ICON_SIZE = 12;

function getAchievement(achievement: AchievementType) {
	switch (achievement) {
		case "Hit Peak": {
			return (
				<AchievementItem
					icon={<StarFilledIcon width={ICON_SIZE} height={ICON_SIZE} />}
					label={"Hit Peak"}
					className={"border-primary-500 bg-primary-900/30 text-primary-500"}
				/>
			);
		}
		case "New Low": {
			return (
				<AchievementItem
					icon={<CircleBackslashIcon width={ICON_SIZE} height={ICON_SIZE} />}
					label={"New Low"}
					className={"border-warning-400 bg-warning-900/30 text-warning-400"}
				/>
			);
		}
		case "Big Jump": {
			return (
				<AchievementItem
					icon={<ArrowUpIcon width={ICON_SIZE} height={ICON_SIZE} />}
					label={"Big Jump"}
					className={"border-success-500 bg-success-900/30 text-success-500"}
				/>
			);
		}
		case "Big Drop": {
			return (
				<AchievementItem
					icon={<ArrowDownIcon width={ICON_SIZE} height={ICON_SIZE} />}
					label={"Big Drop"}
					className={"border-danger-500 bg-danger-900/30 text-danger-500"}
				/>
			);
		}
		case "Hot Streak": {
			return (
				<AchievementItem
					icon={<FaFireAlt size={ICON_SIZE} />}
					label={"Hot Streak"}
					className={"border-amber-500 bg-amber-900/30 text-amber-500 lg:w-24"}
				/>
			);
		}
		case "Burning Streak": {
			return (
				<AchievementItem
					icon={<FaFire size={ICON_SIZE} />}
					label={"Burning"}
					className={"border-amber-200 bg-amber-500/30 text-amber-200 lg:w-24"}
				/>
			);
		}
		case "Cold Streak": {
			return (
				<AchievementItem
					icon={<IoSnowOutline size={ICON_SIZE} />}
					label={"Cold Streak"}
					className={"border-sky-500 bg-sky-900/30 text-sky-400 lg:w-24"}
				/>
			);
		}
		case "Freezing Streak": {
			return (
				<AchievementItem
					icon={<FaSnowflake size={ICON_SIZE} />}
					label={"Freezing"}
					className={"border-sky-200 bg-sky-500/30 text-sky-200 lg:w-24"}
				/>
			);
		}
	}
}

export default function AchievementDisplay({
	achievements,
}: AchievementDisplayProps) {
	return (
		<>
			{achievements && (
				<Tooltip
					key={achievements[0]}
					content={achievements[0]}
					className="lg:hidden"
				>
					{getAchievement(achievements[0])}
				</Tooltip>
			)}
		</>
	);
}

type AchievementItemProps = {
	icon: React.ReactNode;
	label: string;
	className: React.HTMLAttributes<HTMLDivElement>["className"];
};

function AchievementItem({ className, icon, label }: AchievementItemProps) {
	return (
		<div
			className={cn(
				"flex justify-center rounded-lg border p-2 lg:w-22",
				className
			)}
		>
			<div className="flex items-center gap-1">
				{icon}
				<p className="hidden text-nowrap text-xs lg:block">{label}</p>
			</div>
		</div>
	);
}
