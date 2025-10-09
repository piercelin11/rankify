import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type StatsCardProps = {
	title?: string;
	value?: string | ReactNode | number;
	subtitle?: string;
	extra?: ReactNode | string | number;
	className?: string;
	children?: React.ReactNode;
	backgroundImg?: string | null;
};

export default function StatsCard({
	title,
	value,
	subtitle,
	extra,
	className,
	children,
	backgroundImg,
}: StatsCardProps) {
	const cardStyle = backgroundImg
		? {
				backgroundImage: `linear-gradient(to top, hsl(var(--background) / 0.9), hsl(var(--accent) / 0.55) ), url(${backgroundImg})`,
			}
		: {};

	return (
		<Card
			className={cn(
				"relative flex flex-col justify-between space-y-6 overflow-hidden bg-[length:150%] bg-center p-4 transition-all duration-300 ease-in-out hover:bg-[length:160%] 2xl:p-6",
				className
			)}
			style={cardStyle}
		>
			{children || (
				<>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="text-base font-semibold">{title}</h3>
							{extra}
						</div>
						{typeof value === "string" || typeof value === "number" ? (
							<p className="line-clamp-3 font-numeric text-3xl font-bold">
								{value}
							</p>
						) : (
							value
						)}
					</div>
					{subtitle && (
						<p
							className={cn("mt-auto text-muted-foreground", {
								"text-secondary-foreground": backgroundImg,
							})}
						>
							{subtitle}
						</p>
					)}
				</>
			)}
		</Card>
	);
}
