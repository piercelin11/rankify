import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { DraftItemType } from "@/types/home";
import { PLACEHOLDER_PIC } from "@/constants/placeholder.constants";

type DraftsSectionProps = {
	drafts: DraftItemType[];
};

export default function DraftsSection({ drafts }: DraftsSectionProps) {
	if (drafts.length === 0) return null;

	return (
		<section className="space-y-4">
			<h2 className="text-2xl font-bold">繼續你的排名</h2>

			{/* 橫向捲動容器 */}
			<div className="flex gap-4 overflow-x-auto pb-4">
				{drafts.map((draft) => {
					// 🟢 信任過濾邏輯,簡化型別守衛
					const progress = Math.round(draft.draftState.percent);

					const targetType = draft.type.toLowerCase(); // "artist" | "album"
					const targetId =
						draft.type === "ARTIST" ? draft.artistId : draft.albumId; // 🟢 移除不必要的 fallback

					const displayName =
						draft.type === "ARTIST"
							? draft.artist.name
							: draft.album?.name || "Unknown";

					const displayImg =
						draft.type === "ARTIST" ? draft.artist.img : draft.album?.img;

					return (
						<Link
							key={draft.id}
							href={`/sorter/${targetType}/${targetId}`}
							className="group"
						>
							<Card className="w-[200px] flex-shrink-0 transition-transform hover:scale-105">
								<CardContent className="space-y-3 p-4">
									{/* 封面 */}
									<div className="relative aspect-square overflow-hidden rounded-lg">
										<Image
											src={displayImg || PLACEHOLDER_PIC}
											alt={displayName}
											fill
											className="object-cover"
										/>
									</div>

									{/* 標題 */}
									<h3 className="truncate font-semibold">{displayName}</h3>

									{/* 進度條 */}
									<div className="space-y-1">
										<Progress value={progress} />
										<p className="text-xs text-muted-foreground">
											{progress}% complete
										</p>
									</div>

									{/* Badge */}
									<Badge variant="secondary">Draft</Badge>
								</CardContent>
							</Card>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
