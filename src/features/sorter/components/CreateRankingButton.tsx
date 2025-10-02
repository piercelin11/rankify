"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRankingNavigation } from "@/features/sorter/hooks/useRankingNavigation";
import { $Enums } from "@prisma/client";
 
type CreateRankingButtonProps = {
	artistId: string;
	variant?: "full" | "icon";
	type?: $Enums.SubmissionType;
	albumId?: string;
	className?: string;
};

export function CreateRankingButton({
	artistId,
	variant = "full",
	type = "ARTIST",
	albumId,
	className,
}: CreateRankingButtonProps) {
	const { navigateToRanking, isNavigating } = useRankingNavigation({
		artistId,
		type,
		albumId,
	});

	if (variant === "icon") {
		return (
			<Button
				size="icon"
				className={className || "size-10 rounded-full"}
				onClick={navigateToRanking}
				disabled={isNavigating}
			>
				<Plus className="h-8 w-8 text-primary-foreground" />
			</Button>
		);
	}

	return (
		<Button
			className={className || "h-10 rounded-full text-sm"}
			onClick={navigateToRanking}
			disabled={isNavigating}
		>
			<Plus className="h-8 w-8 text-primary-foreground" />
			Create
		</Button>
	);
}
