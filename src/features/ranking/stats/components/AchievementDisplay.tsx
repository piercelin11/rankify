import { cn } from "@/lib/cn";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CircleBackslashIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import React from "react";

export type AchievementType =
	| "Hit Peak"
	| "New Low"
	| "Big Jump"
	| "Big Drop"
	| null;

type AchievementDisplayProps = {
	achievement?: AchievementType | null;
};

export default function AchievementDisplay({
	achievement,
}: AchievementDisplayProps) {
	function getAchievement() {
		if (achievement === "Hit Peak")
			return (
				<AchievementItem
					icon={<StarFilledIcon width={12} height={12} />}
					label={"Hit Peak"}
					className={"bg-primary-950/40 border-primary-400 text-primary-400"}
				/>
			);
		else if (achievement === "New Low")
			return (
				<AchievementItem
					icon={<CircleBackslashIcon width={12} height={12} />}
					label={"New Low"}
					className={"bg-warning-950/40 border-warning-400 text-warning-400"}
				/>
			);
		else if (achievement === "Big Jump")
			return (
				<AchievementItem
					icon={<ArrowUpIcon width={12} height={12} />}
					label={"Big Jump"}
					className={"border-success-400 bg-success-950/30 text-success-400"}
				/>
			);
		if (achievement === "Big Drop")
			return (
				<AchievementItem
					icon={<ArrowDownIcon width={12} height={12} />}
					label={"Big Drop"}
					className={"border-danger-400 bg-danger-950/40 text-danger-400"}
				/>
			);
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
				"flex justify-center rounded-full border p-2 lg:w-24",
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
