import { cn } from "@/lib/cn";
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
				<AchievementItem
					icon={<StarFilledIcon width={12} height={12} />}
					label={"Hit Peak"}
					className={"border-primary-500 bg-primary-500/5 text-primary-500"}
				/>
			);
		else if (achievement === "Big Jump")
			return (
				<AchievementItem
					icon={<ArrowUpIcon width={12} height={12} />}
					label={"Big Jump"}
					className={"border-success-500 bg-success-500/5 text-success-500"}
				/>
			);
		if (achievement === "Big Drop")
			return (
				<AchievementItem
					icon={<ArrowDownIcon width={12} height={12} />}
					label={"Big Drop"}
					className={"border-danger-500 bg-danger-500/5 text-danger-500"}
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
				<p className="text-nowrap text-sm hidden lg:block">{label}</p>
			</div>
		</div>
	);
}
