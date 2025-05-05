import { cn } from "@/lib/cn";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CircleBackslashIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import { FaFireAlt } from "react-icons/fa";
import { IoSnowOutline } from "react-icons/io5";
import React from "react";

export type AchievementType =
	| "Hit Peak"
	| "New Low"
	| "Big Jump"
	| "Big Drop"
	| "Hot Streak"
	| "Cold Streak"
	| null;

type AchievementDisplayProps = {
	achievement?: AchievementType | null;
};

const ICON_SIZE = 12;

export default function AchievementDisplay({
	achievement,
}: AchievementDisplayProps) {
	function getAchievement() {
		switch (achievement) {
			case "Hit Peak": {
				return (
					<AchievementItem
						icon={<StarFilledIcon width={ICON_SIZE} height={ICON_SIZE} />}
						label={"Hit Peak"}
						className={"bg-primary-950/40 border-primary-400 text-primary-400"}
					/>
				);
			}
			case "New Low": {
				return (
					<AchievementItem
						icon={<CircleBackslashIcon width={ICON_SIZE} height={ICON_SIZE} />}
						label={"New Low"}
						className={"border-warning-400 bg-warning-950/40 text-warning-400"}
					/>
				);
			}
			case "Big Jump": {
				return (
					<AchievementItem
						icon={<ArrowUpIcon width={ICON_SIZE} height={ICON_SIZE} />}
						label={"Big Jump"}
						className={"border-success-400 bg-success-950/30 text-success-400"}
					/>
				);
			}
			case "Big Drop": {
				return (
					<AchievementItem
						icon={<ArrowDownIcon width={ICON_SIZE} height={ICON_SIZE} />}
						label={"Big Drop"}
						className={"border-danger-400 bg-danger-950/40 text-danger-400"}
					/>
				);
			}
			case "Hot Streak": {
				return (
					<AchievementItem
						icon={<FaFireAlt size={ICON_SIZE} />}
						label={"Hot Streak"}
						className={"border-danger-500 bg-danger-950/40 text-danger-400 lg:w-28"}
					/>
				);
			}
			case "Cold Streak": {
				return (
					<AchievementItem
						icon={<IoSnowOutline size={ICON_SIZE} />}
						label={"Cold Streak"}
						className={"border-blue-500 bg-blue-950/40 text-blue-400 lg:w-28"}
					/>
				);
			}
		}
	}

	return <>{getAchievement()}</>;
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
				"flex justify-center rounded-lg border p-2 lg:w-24",
				className
			)}
		>
			<div className="flex items-center gap-1">
				{icon}
				<p className="hidden text-nowrap text-sm lg:block">{label}</p>
			</div>
		</div>
	);
}
