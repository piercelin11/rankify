import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { HeroItemType } from "@/types/home";
import { PLACEHOLDER_PIC } from "@/constants";
import { formatDistanceToNow } from "date-fns";

type HeroSectionProps = {
	hero: HeroItemType | null;
};

export default function HeroSection({ hero }: HeroSectionProps) {
	if (!hero) return null;

	const { type, data } = hero;

	const getConfig = () => {
		switch (type) {
			case "achievement":
				return {
					badge: "Recent Achievement",
					badgeVariant: "default" as const,
					title: `Congratulations! You completed "${data.name}"`,
					description: (
						<p className="text-sm text-muted-foreground">
							Completed {formatDistanceToNow(data.completedAt!, { addSuffix: true })}
						</p>
					),
					ctaText: "View Results",
					ctaHref:
						data.type === "ARTIST"
							? `/artist/${data.artistId}/my-stats?submissionId=${data.submissionId}`
							: `/artist/${data.artistId}/album/${data.id}`, // TODO: 待專輯頁面完成後更新為正確的結果頁面路由
				};

			case "resume":
				return {
					badge: "Continue your ranking",
					badgeVariant: "outline" as const,
					title: `${data.name}`,
					description: (
						<div className="flex items-center gap-3 w-full max-w-lg">
							<Progress value={data.progress || 0} className="h-2 flex-1 bg-foreground/10" />
							<span className="text-sm text-muted-foreground shrink-0">
								{Math.round(data.progress || 0)}% completed
							</span>
						</div>
					),
					ctaText: "Continue Ranking",
					ctaHref:
						data.type === "ARTIST"
							? `/sorter/artist/${data.id}`
							: `/sorter/album/${data.id}`,
				};

			case "top_artist":
				return {
					badge: "Your Top Artist",
					badgeVariant: "outline" as const,
					title: `${data.name}`,
					description: (
						<p className="text-sm text-muted-foreground">Most frequently ranked artist</p>
					),
					ctaText: "View Details",
					ctaHref: `/artist/${data.artistId}`,
				};

			case "discovery":
				return {
					badge: "Discover New Artists",
					badgeVariant: "outline" as const,
					title: `How about ranking "${data.name}"?`,
					description: (
						<p className="text-sm text-muted-foreground">Artist you haven&apos;t ranked yet</p>
					),
					ctaText: "Start Ranking",
					ctaHref: `/artist/${data.artistId}`,
				};
		}
	};

	const config = getConfig();

	return (
		<section className="w-full">
			<Card className="relative overflow-hidden border-2">
				<div className="flex flex-col md:flex-row items-stretch min-h-[20rem]">
					{/* 左側圖片 */}
					<div className="relative w-full md:w-1/3 aspect-square md:aspect-auto md:h-auto flex-shrink-0">
						<Image
							src={data.img || PLACEHOLDER_PIC}
							alt={data.name}
							fill
							className="object-cover"
						/>
					</div>

					{/* 右側內容 */}
					<div className="flex-1 relative overflow-hidden bg-accent/80">
						{/* 背景層 - 模糊圖片 */}
						<div
							className="absolute inset-0 opacity-30 scale-110 bg-cover bg-center blur-3xl"
							style={{ backgroundImage: `url("${data.img}")` }}
							aria-hidden="true"
						/>

						{/* 內容層 */}
						<div className="relative z-10 flex items-center h-full p-10">
							<div className="space-y-2 text-center md:text-left w-full">
								<p className="uppercase font-bold text-sm">{config.badge}</p>
								<h2 className="text-3xl font-bold">{config.title}</h2>
								{config.description}
								<Link href={config.ctaHref}>
									<Button size="lg" className="mt-4">
										{config.ctaText}
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</section>
	);
}
