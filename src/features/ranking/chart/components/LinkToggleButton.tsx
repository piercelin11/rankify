"use client";

import { Link1Icon, LinkNone1Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import Tooltip from "@/components/overlay/Tooltip";

type Props = {
	linked: boolean;
	onToggle: () => void;
};

export default function LinkToggleButton({ linked, onToggle }: Props) {
	return (
		<Tooltip content={linked ? "Unlink charts" : "Link charts"}>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				aria-label={linked ? "Unlink charts" : "Link charts"}
				aria-pressed={linked}
				className="rounded-full size-12 border border-border/60 bg-background/60 shadow"
				onClick={onToggle}
			>
				{linked ? <Link1Icon /> : <LinkNone1Icon />}
			</Button>
		</Tooltip>
	);
}
