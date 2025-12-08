import Link from "next/link";
import Image from "next/image";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DraftItemType } from "@/types/home";
import { PLACEHOLDER_PIC } from "@/constants/placeholder.constants";

type DraftsSectionProps = {
	drafts: DraftItemType[];
};

export default function DraftsSection({ drafts }: DraftsSectionProps) {
	if (drafts.length === 0) return null;

	return (
		<section className="space-y-3">
			<h2 className="text-2xl font-bold">Continue Your Rankings</h2>

			<Carousel opts={{ align: "start", loop: false }} className="w-full">
				<CarouselContent className="-ml-4">
					{drafts.map((draft) => {
						const progress = Math.round(draft.draftState.percent);
						const targetType = draft.type.toLowerCase();
						const targetId =
							draft.type === "ARTIST" ? draft.artistId : draft.albumId;
						const displayName =
							draft.type === "ARTIST"
								? draft.artist.name
								: draft.album?.name || "Unknown";
						const displayImg =
							draft.type === "ARTIST" ? draft.artist.img : draft.album?.img;

						return (
							<CarouselItem
								key={draft.id}
								className="pl-4 basis-1/2 md:basis-1/2 lg:basis-1/3 2xl:basis-1/4"
							>
								<Link
									href={`/sorter/${targetType}/${targetId}`}
									className="group"
								>
									<Card className="border-0 bg-transparent transition-transform">
										<CardContent className="space-y-3 p-0">
											{/* 封面 */}
											<div className="relative aspect-video overflow-hidden rounded-lg">
												<Image
													src={displayImg || PLACEHOLDER_PIC}
													alt={displayName}
													fill
													className="object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
												/>
											</div>

											{/* 標題 */}
											<div>
												<p className="text-xs font-bold uppercase">
													{draft.type}
												</p>
												<h3 className="truncate font-bold">
													{displayName}
												</h3>
											</div>

											{/* 進度條 */}
											<div className="space-y-1">
												<Progress value={progress} />
												<p className="text-xs text-muted-foreground">
													{progress}% complete
												</p>
											</div>
										</CardContent>
									</Card>
								</Link>
							</CarouselItem>
						);
					})}
				</CarouselContent>
				<CarouselPrevious variant="ghost" className="hidden md:flex" />
				<CarouselNext variant="ghost" className="hidden md:flex" />
			</Carousel>
		</section>
	);
}
