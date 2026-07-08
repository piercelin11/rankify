"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type Props = {
	showToggle: boolean;
	expanded: boolean;
	onToggle: () => void;
};

export default function ListDivider({ showToggle, expanded, onToggle }: Props) {
	if (!showToggle) {
		return <Separator className="bg-border/50" />;
	}

	return (
		<div className="flex items-center gap-3">
			<Separator className="flex-1 bg-border/50" />
			<Button
				type="button"
				variant="ghost"
				className="shrink-0 text-muted-foreground"
				onClick={onToggle}
			>
				{expanded ? "Show less" : "Show all"}
			</Button>
			<Separator className="flex-1 bg-border/50" />
		</div>
	);
}
