import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type StatsCardProps = {
	title?: string;
	value?: string | ReactNode | number;
	subtitle?: string;
	badge?: {
		text: string;
		variant?: "default" | "outline" | "secondary" | "destructive";
	};
	className?: string;
	children?: React.ReactNode;
};

export default function StatsCard({
	title,
	value,
	subtitle,
	badge,
	className,
	children,
}: StatsCardProps) {
	return (
		<Card
			className={cn(
				"flex flex-col justify-between space-y-6 bg-gradient-to-b from-transparent to-background p-8",
				className
			)}
		>
			{children || (
				<>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="text-base font-semibold">{title}</h3>
							{badge && (
								<Badge
									variant={badge.variant || "outline"}
									className=""
								>
									{badge.text}
								</Badge>
							)}
						</div>
						<p className="text-3xl font-bold">{value}</p>
					</div>
					{subtitle && <p className="mt-auto text-muted-foreground">{subtitle}</p>}
				</>
			)}
		</Card>
	);
}
