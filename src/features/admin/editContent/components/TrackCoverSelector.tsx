"use client";

import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import { cn } from "@/lib/utils";
import fetchSearchResults from "@/lib/spotify/fetchSearchResults";
import { TrackData } from "@/types/data";
import { CheckIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

type TrackCoverSelectorProps = {
	track: TrackData;
	onChange: () => void;
	onBlur: () => void;
	value: string;
};

export default function TrackCoverSelector({
	track,
	onChange,
	onBlur,
	value,
}: TrackCoverSelectorProps) {
	const [trackCoverOptions, setTrackCoverOptions] = useState<string[]>([]);

	useEffect(() => {
		async function fetchCover() {
			const data =
				(await fetchSearchResults(
					`artist:${track.artist?.name} track:${track.name}`,
					"track",
					4
				)) ?? [];
			setTrackCoverOptions([
				...new Set(
					[track.img ?? undefined, ...data.map((t) => t?.album?.images?.[0]?.url)].filter(
						(url): url is string => Boolean(url)
					)
				),
			]);
		}
		fetchCover();
	}, [track.artist?.name, track.img, track.name]);

	return (
		<div className="space-y-3">
			<Label className="text-neutral-200">Track Cover</Label>
			<div className="flex h-20 items-center gap-4">
				{trackCoverOptions.length !== 0 ? (
					trackCoverOptions.map((url) => (
						<label
							key={url}
							className={cn(
								"relative flex items-center gap-2 overflow-hidden rounded text-muted-foreground",
								{
									"outline outline-2 outline-primary-500": value === url,
								}
							)}
						>
							{value === url && (
								<div className="absolute left-1 top-1 rounded-full bg-primary-500 p-1">
									<CheckIcon
										className="text-neutral-950"
										width={15}
										height={15}
									/>
								</div>
							)}
							<Image
								className={cn({ "opacity-40": value !== url })}
								src={url}
								width={80}
								height={80}
								alt={"track cover options"}
							/>
							<input
								type="radio"
								onChange={onChange}
								onBlur={onBlur}
								name="img"
								value={url}
								hidden
							/>
						</label>
					))
				) : (
					<LoadingAnimation />
				)}
			</div>
		</div>
	);
}
