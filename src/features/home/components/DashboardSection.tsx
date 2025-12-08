import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { DashboardStatsType } from "@/types/home";

type DashboardSectionProps = {
	stats: DashboardStatsType;
};

export default function DashboardSection({ stats }: DashboardSectionProps) {
	return (
		<section className="space-y-6">
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
				{/* Top Artist */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-bold uppercase text-foreground">
							Top Artist
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{stats.topArtist?.name || "—"}
						</div>
						<p className="text-sm text-muted-foreground">most ranked</p>
					</CardContent>
				</Card>

				{/* Completed Rankings */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-bold uppercase text-foreground">
							Completed Rankings
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-numeric text-3xl font-bold">
							{stats.rankingCount}
						</div>
						<p className="text-sm text-muted-foreground">rankings completed</p>
					</CardContent>
				</Card>

				{/* Total Songs Rated */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-bold uppercase text-foreground">
							Total Songs Rated
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-numeric text-3xl font-bold">
							{stats.songCount}
						</div>
						<p className="text-sm text-muted-foreground">songs rated</p>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
