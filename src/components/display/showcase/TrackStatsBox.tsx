import React, { ReactNode } from "react";

type TrackStatsBoxProps = {
	children: ReactNode;
	stats: string | number | null;
	subtitle: string;
};

export default function TrackStatsBox({
	children,
	stats,
	subtitle,
}: TrackStatsBoxProps) {
	return (
		<div className="flex flex-1 flex-col items-start gap-20 rounded-3xl bg-zinc-900 p-8">
			<div className="rounded-full bg-zinc-750 p-4">{children}</div>
			<div className="space-y-2">
				<p className="font-numeric text-3xl font-black">{stats ?? "no data"}</p>
				<p className="text-zinc-500">{subtitle}</p>
			</div>
		</div>
	);
}
