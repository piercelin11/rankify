import { cn } from "@/lib/cn";
import Link from "next/link";
import React from "react";
import { SpotifyIcon } from "../../icon/LogoIcons";
import { AlbumData, ArtistData, TrackData } from "@/types/data";

type InfoHeaderProps = {
	data: AlbumData | ArtistData | TrackData;
	subTitle: string;
	rounded?: boolean;
	type?: string;
};

export default function InfoHeader({
	data,
	subTitle,
	rounded = false,
	type,
}: InfoHeaderProps) {
	return (
		<div className="bg-zinc-900 p-8 2xl:p-14">
			<div
				className={cn("flex items-center pt-12 2xl:pt-24", {
					"gap-8": !rounded,
					"gap-6": rounded,
				})}
			>
				<img
					className={cn("w-[220px] 2xl:w-[280px]", {
						"rounded-full": rounded,
						"rounded-md": !rounded
					})}
					src={data.img || undefined}
					alt={data.name}
				/>
				<div>
					{type && <p>{type}</p>}
					<h1>{data.name}</h1>
					<p className="mb-4 text-lg text-zinc-500">{subTitle}</p>
					<Link href={data.spotifyUrl} className="inline-block">
						<SpotifyIcon
							className="text-zinc-600 hover:text-spotify"
							size={30}
						/>
					</Link>
				</div>
			</div>
		</div>
	);
}
