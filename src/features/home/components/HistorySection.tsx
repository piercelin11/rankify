import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import GalleryItem from "@/components/presentation/GalleryItem";
import type { HistoryItemType } from "@/types/home";
import { formatDistanceToNow } from "date-fns";

type HistorySectionProps = {
	history: HistoryItemType[];
};

export default function HistorySection({ history }: HistorySectionProps) {
	if (history.length === 0) return null;

	return (
		<section className="space-y-3">
			<h2 className="text-2xl font-bold">Recently Completed</h2>

			<Carousel opts={{ align: "start", loop: false }} className="w-full">
				<CarouselContent>
					{history.map((item) => {
						const displayName =
							item.type === "ARTIST"
								? item.artist.name
								: item.album?.name || "Unknown";
						const displayImg =
							item.type === "ARTIST"
								? item.artist.img
								: item.album?.img ?? null;
						const relativeTime = item.completedAt
							? formatDistanceToNow(new Date(item.completedAt), {
									addSuffix: true,
								})
							: "";

						return (
							<CarouselItem
								key={item.id}
								className="basis-1/2 md:basis-1/3 xl:basis-1/6 2xl:basis-1/8"
							>
								<GalleryItem
									href={`/artist/${item.artistId}?submissionId=${item.id}`}
									img={displayImg}
									title={displayName}
									subTitle={relativeTime}
									type={item.type}
								/>
							</CarouselItem>
						);
					})}
				</CarouselContent>
				<CarouselPrevious variant={"ghost"} className="hidden md:flex" />
				<CarouselNext variant={"ghost"} className="hidden md:flex" />
			</Carousel>
		</section>
	);
}
