import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import GalleryItem from "@/components/presentation/GalleryItem";
import type { DiscoveryType } from "@/types/home";

type DiscoverySectionProps = {
	data: DiscoveryType[];
	title: string;
	type?: "ALBUM" | "ARTIST";
};

export default function DiscoverySection({
	data,
	title,
	type = "ARTIST",
}: DiscoverySectionProps) {
	if (data.length === 0) return null;

	return (
		<section className="space-y-3">
			<h2 className="text-2xl font-bold">{title}</h2>

			<Carousel opts={{ align: "start", loop: false }} className="w-full">
				<CarouselContent>
					{data.map((item) => (
						<CarouselItem
							key={item.id}
							className="basis-1/2 md:basis-1/3 xl:basis-1/6 2xl:basis-1/8"
						>
							<GalleryItem
								href={
									type === "ARTIST"
										? `/artist/${item.id}`
										: `/sorter/album/${item.id}`
								}
								img={item.img}
								title={item.name}
								subTitle="Artist"
								type={type}
							/>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious variant={"ghost"} className="hidden md:flex" />
				<CarouselNext variant={"ghost"} className="hidden md:flex" />
			</Carousel>
		</section>
	);
}
