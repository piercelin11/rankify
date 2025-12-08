import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import GalleryItem from "@/components/presentation/GalleryItem";
import type { DiscoveryArtistType } from "@/types/home";

type DiscoverySectionProps = {
	artists: DiscoveryArtistType[];
};

export default function DiscoverySection({ artists }: DiscoverySectionProps) {
	if (artists.length === 0) return null;

	return (
		<section className="space-y-3">
			<h2 className="text-2xl font-bold">Discover New Artists</h2>

			<Carousel opts={{ align: "start", loop: false }} className="w-full">
				<CarouselContent>
					{artists.map((artist) => (
						<CarouselItem
							key={artist.id}
							className="basis-1/2 md:basis-1/3 xl:basis-1/6 2xl:basis-1/8"
						>
							<GalleryItem
								href={`/artist/${artist.id}`}
								img={artist.img}
								title={artist.name}
								subTitle="Artist" // subTitle="Artist" 觸發圓形顯示
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
