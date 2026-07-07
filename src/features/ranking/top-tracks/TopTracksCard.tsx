import Image from "next/image";
import Link from "next/link";
import { PLACEHOLDER_PIC } from "@/constants/placeholder.constants";
import type { TrackStatsType } from "@/types/track";
import { TOP_TRACKS_COLUMNS, type TopTracksColumnKey } from "./columns";

type TopTracksCardProps = {
	tracks: TrackStatsType[];
	columnKey?: TopTracksColumnKey[];
	title?: string;
};

export default function TopTracksCard({
	tracks,
	columnKey = ["highestRank"],
	title = "Top Tracks",
}: TopTracksCardProps) {
	if (tracks.length === 0) return null;

	return (
		<section>
			<h2>{title}</h2>
			<div>
				<div className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground">
					<div className="w-8 shrink-0" />
					<div className="flex-1" />
					{columnKey.map((key) => (
						<div key={key} className="w-[100px] shrink-0 text-right">
							{TOP_TRACKS_COLUMNS[key].header}
						</div>
					))}
				</div>

				{tracks.map((track) => (
					<Link
						key={track.id}
						href={`/artist/${track.artistId}/track/${track.id}`}
						className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/50"
					>
						<div className="w-6 shrink-0 text-left font-numeric text-xl text-foreground">
							0{track.overallRank}
						</div>
						<div className="flex min-w-0 flex-1 items-center gap-3">
							<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg lg:h-18 lg:w-18">
								<Image
									src={track.img || PLACEHOLDER_PIC}
									alt={track.name}
									fill
									sizes="64px"
									className="object-cover"
								/>
							</div>
							<div className="min-w-0">
								<p className="truncate font-semibold">{track.name}</p>
								{track.album?.name && (
									<p className="truncate text-sm text-muted-foreground">
										{track.album.name}
									</p>
								)}
							</div>
						</div>
						{columnKey.map((key) => (
							<div
								key={key}
								className="w-[100px] shrink-0 text-right text-base"
							>
								{track[key]}
							</div>
						))}
					</Link>
				))}
			</div>
		</section>
	);
}
