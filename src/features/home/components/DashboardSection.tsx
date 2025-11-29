import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";
import type { DashboardStatsType } from "@/types/home";

type DashboardSectionProps = {
	stats: DashboardStatsType;
	userName?: string | null;
};

export default function DashboardSection({
	stats,
	userName,
}: DashboardSectionProps) {
	return (
		<section className="space-y-6">
			{/* 歡迎語 */}
			<h1 className="text-3xl font-bold">Hi, {userName || "User"}</h1>

			{/* 3 欄數據概覽 */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{/* 已完成排名 */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm text-muted-foreground">
							已完成排名
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{stats.rankingCount}</div>
						<p className="text-xs text-muted-foreground">次排名達成</p>
					</CardContent>
				</Card>

				{/* 評鑑單曲總數 */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm text-muted-foreground">
							評鑑單曲總數
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{stats.songCount}</div>
						<p className="text-xs text-muted-foreground">首單曲已評分</p>
					</CardContent>
				</Card>

				{/* 本命歌手 */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm text-muted-foreground">
							本命歌手
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.topArtist?.name || "—"}
						</div>
						<p className="text-xs text-muted-foreground">最常排名</p>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
