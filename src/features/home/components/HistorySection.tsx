import type { HistoryItemType } from "@/types/home";
import GalleryItem from "@/components/presentation/GalleryItem";
import { formatDistanceToNow } from "date-fns";

type HistorySectionProps = {
	history: HistoryItemType[];
};

export default function HistorySection({ history }: HistorySectionProps) {
	if (history.length === 0) return null;

	return (
		<section className="space-y-4">
			<h2 className="text-2xl font-bold">最近完成</h2>

			<div className="flex gap-4 overflow-x-auto pb-4">
				{history.map((item) => {
					const displayName =
						item.type === "ARTIST"
							? item.artist.name
							: item.album?.name || "Unknown";

					const displayImg =
						item.type === "ARTIST" ? item.artist.img : (item.album?.img ?? null);

					const relativeTime = item.completedAt
						? formatDistanceToNow(new Date(item.completedAt), {
								addSuffix: true,
							})
						: "";

					return (
						<div key={item.id} className="w-[160px] flex-shrink-0">
							<GalleryItem
								href={`/artist/${item.artistId}/my-stats?submissionId=${item.id}`}
								img={displayImg}
								title={displayName}
								subTitle={relativeTime}
							/>
						</div>
					);
				})}
			</div>
		</section>
	);
}
