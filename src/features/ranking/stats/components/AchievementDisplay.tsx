import { cn } from "@/lib/utils";
import { CircleBackslashIcon, StarFilledIcon } from "@radix-ui/react-icons";

import Tooltip from "@/components/overlay/Tooltip";
import { TbWaveSine } from "react-icons/tb";
import { RiAnchorFill } from "react-icons/ri";
import {
	MdKeyboardArrowDown,
	MdKeyboardArrowUp,
	MdKeyboardDoubleArrowDown,
	MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { IoMdArrowRoundUp, IoMdArrowRoundDown } from "react-icons/io";

export type AchievementType =
	| "New Peak"
	| "New Low"
	| "Big Jump"
	| "Big Drop"
	| "Ascent"
	| "Descent"
	| "Surge"
	| "Plunge"
	| "Drifter"
	| "Anchor";

type AchievementDisplayProps = {
	achievements?: AchievementType[] | null;
};

const ICON_SIZE = 12;

const POSITIVE_STYLE = "border-success-500 bg-success-900/10 text-success-500";
const NEGATIVE_STYLE = "border-danger-500 bg-danger-900/10 text-danger-500";
const NEUTRAL_STYLE =
	"border-lavender-500 bg-lavender-900/20 text-lavender-500";

function getAchievement(achievement: AchievementType) {
	switch (achievement) {
		case "New Peak": {
			return (
				<AchievementItem
					icon={<StarFilledIcon width={ICON_SIZE} height={ICON_SIZE} />}
					label={"New Peak"}
					className={"border-primary-500 bg-neutral-100-900/30 text-primary-500"}
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
					icon={<IoMdArrowRoundUp size={ICON_SIZE} />}
					label={"Big Jump"}
					className={POSITIVE_STYLE}
				/>
			);
		}
		case "Big Drop": {
			return (
				<AchievementItem
					icon={<IoMdArrowRoundDown size={ICON_SIZE} />}
					label={"Big Drop"}
					className={NEGATIVE_STYLE}
				/>
			);
		}
		case "Ascent": {
			return (
				<AchievementItem
					icon={<MdKeyboardArrowUp size={ICON_SIZE} />}
					label={"Ascent"}
					className={cn("lg:w-20", POSITIVE_STYLE)}
				/>
			);
		}
		case "Surge": {
			return (
				<AchievementItem
					icon={<MdKeyboardDoubleArrowUp size={ICON_SIZE} />}
					label={"Surge"}
					className={cn("lg:w-20", POSITIVE_STYLE)}
				/>
			);
		}
		case "Descent": {
			return (
				<AchievementItem
					icon={<MdKeyboardArrowDown size={ICON_SIZE} />}
					label={"Descent"}
					className={cn("lg:w-20", NEGATIVE_STYLE)}
				/>
			);
		}
		case "Plunge": {
			return (
				<AchievementItem
					icon={<MdKeyboardDoubleArrowDown size={ICON_SIZE} />}
					label={"Plunge"}
					className={cn("lg:w-20", NEGATIVE_STYLE)}
				/>
			);
		}
		case "Drifter": {
			return (
				<AchievementItem
					icon={<TbWaveSine size={ICON_SIZE} />}
					label={"Drifter"}
					className={cn("lg:w-20", NEUTRAL_STYLE)}
				/>
			);
		}
		case "Anchor": {
			return (
				<AchievementItem
					icon={<RiAnchorFill size={ICON_SIZE} />}
					label={"Anchor"}
					className={cn("lg:w-20", NEUTRAL_STYLE)}
				/>
			);
		}
	}
}

export default function AchievementDisplay({
	achievements,
}: AchievementDisplayProps) {
	return (
		<div className="flex gap-2">
			{/* {achievements && (
				<Tooltip
					key={achievements[0]}
					content={achievements[0]}
					className="lg:hidden"
				>
					{getAchievement(achievements[0])}
				</Tooltip>
			)} */}
			{achievements?.map((achievement) => (
				<Tooltip key={achievement} content={achievement} className="lg:hidden">
					{getAchievement(achievement)}
				</Tooltip>
			))}
		</div>
	);
}

type AchievementItemProps = {
	icon: React.ReactNode;
	label: string;
	className?: React.HTMLAttributes<HTMLDivElement>["className"];
	style?: React.HTMLAttributes<HTMLDivElement>["style"];
};

function AchievementItem({
	className,
	icon,
	label,
	style,
}: AchievementItemProps) {
	return (
		<div
			className={cn(
				"flex justify-center rounded-xl border p-2 lg:w-24",
				className
			)}
			style={style}
		>
			<div className="flex items-center gap-1">
				{icon}
				<p className="hidden text-nowrap text-xs lg:block">{label}</p>
			</div>
		</div>
	);
}
