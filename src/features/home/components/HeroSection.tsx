import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HeroItemType } from "@/types/home";
import { PLACEHOLDER_PIC } from "@/constants";
import { formatDistanceToNow } from "date-fns";

type HeroSectionProps = {
	hero: HeroItemType | null;
};

export default function HeroSection({ hero }: HeroSectionProps) {
	if (!hero) return null;

	const { type, data } = hero;

	// 根據類型定義內容（延遲評估，避免過早執行 formatDistanceToNow）
	const getConfig = () => {
		switch (type) {
			case "achievement":
				return {
					badge: "🎉 Recent Achievement",
					badgeVariant: "default" as const,
					title: `Congratulations! You completed "${data.name}"`,
					description: `Completed ${formatDistanceToNow(data.completedAt!, { addSuffix: true })}`,
					ctaText: "View Results",
					ctaHref:
						data.type === "ARTIST"
							? `/artist/${data.artistId}/my-stats?submissionId=${data.submissionId}`
							: `/artist/${data.artistId}/album/${data.id}`, // TODO: 待專輯頁面完成後更新為正確的結果頁面路由
					bgGradient: "from-yellow-500/20 to-orange-500/20",
				};

			case "resume":
				return {
					badge: "⏸️ In Progress",
					badgeVariant: "secondary" as const,
					title: `Continue ranking "${data.name}"`,
					description: `${Math.round(data.progress || 0)}% complete`,
					ctaText: "Continue Ranking",
					ctaHref:
						data.type === "ARTIST"
							? `/sorter/artist/${data.id}`
							: `/sorter/album/${data.id}`,
					bgGradient: "from-blue-500/20 to-cyan-500/20",
				};

			case "top_artist":
				return {
					badge: "⭐ Your Top Artist",
					badgeVariant: "outline" as const,
					title: `Your top artist is "${data.name}"`,
					description: "Most frequently ranked artist",
					ctaText: "View Details",
					ctaHref: `/artist/${data.artistId}`,
					bgGradient: "from-purple-500/20 to-pink-500/20",
				};

			case "discovery":
				return {
					badge: "🔍 Discover New Artists",
					badgeVariant: "outline" as const,
					title: `How about ranking "${data.name}"?`,
					description: "Artist you haven't ranked yet",
					ctaText: "Start Ranking",
					ctaHref: `/artist/${data.artistId}`,
					bgGradient: "from-gray-500/20 to-slate-500/20",
				};
		}
	};

	const config = getConfig();

	return (
		<section className="w-full">
			<Card
				className={`relative overflow-hidden border-2 bg-gradient-to-br ${config.bgGradient}`}
			>
				<div className="flex flex-col md:flex-row items-center gap-6 p-8">
					{/* 左側圖片 */}
					<div className="relative h-48 w-48 flex-shrink-0">
						<Image
							src={data.img || PLACEHOLDER_PIC}
							alt={data.name}
							fill
							className="rounded-lg object-cover shadow-lg"
						/>
					</div>

					{/* 右側內容 */}
					<div className="flex-1 space-y-4 text-center md:text-left">
						<Badge variant={config.badgeVariant}>{config.badge}</Badge>
						<h2 className="text-3xl font-bold">{config.title}</h2>
						<p className="text-lg text-muted-foreground">{config.description}</p>
						<Link href={config.ctaHref}>
							<Button size="lg" className="mt-4">
								{config.ctaText}
							</Button>
						</Link>
					</div>
				</div>
			</Card>
		</section>
	);
}
