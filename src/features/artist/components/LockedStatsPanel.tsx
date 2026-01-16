"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/contexts/ModalContext";

type LockedStatsPanelProps = {
	artistName: string;
};

// MOCK 資料定義在元件內 (不需抽到 constants)
const MOCK_STATS = {
	totalSubmissions: 127,
	avgRating: 4.2,
	topTrack: {
		id: "mock",
		name: "Example Track",
		rank: 1,
		votes: 89,
	},
	distribution: [23, 45, 12, 8, 4, 2, 1, 0, 0, 0],
};

export default function LockedStatsPanel({ artistName }: LockedStatsPanelProps) {
	const { showAuthGuard } = useModal();

	const handleUnlock = () => {
		showAuthGuard({
			callbackUrl: window.location.pathname,
		});
	};

	return (
		<div className="relative min-h-[400px] rounded-lg border bg-card overflow-hidden">
			{/* 背景: 使用假資料渲染統計面板 */}
			<div className="blur-lg pointer-events-none p-8">
				<h2 className="text-2xl font-bold mb-6">Statistics Overview</h2>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Total Rankings</p>
						<p className="text-3xl font-bold">{MOCK_STATS.totalSubmissions}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Average Rating</p>
						<p className="text-3xl font-bold">{MOCK_STATS.avgRating}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Top Track</p>
						<p className="text-lg font-semibold">{MOCK_STATS.topTrack.name}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Total Votes</p>
						<p className="text-3xl font-bold">{MOCK_STATS.topTrack.votes}</p>
					</div>
				</div>

				{/* 假資料圖表 */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Ranking Distribution</h3>
					<div className="flex items-end gap-2 h-40">
						{MOCK_STATS.distribution.map((value, index) => (
							<div
								key={index}
								className="flex-1 bg-primary rounded-t"
								style={{ height: `${(value / 45) * 100}%` }}
							/>
						))}
					</div>
				</div>
			</div>

			{/* 遮罩層 */}
			<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
				<Lock className="h-12 w-12 mb-4 text-white" />
				<h3 className="text-2xl font-bold mb-2 text-white text-center">
					Unlock {artistName}&apos;s Insights
				</h3>
				<p className="text-sm text-white/80 mb-6 text-center max-w-md px-4">
					Log in to visualize your taste profile and discover your unique music
					journey.
				</p>
				<Button onClick={handleUnlock} size="lg">
					Login to Analyze
				</Button>
			</div>
		</div>
	);
}
