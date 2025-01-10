import { cn } from "@/lib/cn";
import Link from "next/link";
import React, { ReactNode } from "react";
import { SpotifyIcon } from "../../icon/LogoIcons";
import { AlbumData, ArtistData, TrackData } from "@/types/data";

type InfoHeaderProps = {
	data: AlbumData | ArtistData | TrackData;
	subTitle: string | ReactNode;
	rounded?: boolean;
	type?: string;
	color?: string | null;
};

export default function InfoHeader({
	data,
	subTitle,
	rounded = false,
	type,
	color,
}: InfoHeaderProps) {
	return (
		<div
			className={cn("p-8 2xl:p-14", {
				"bg-zinc-900": !color,
			})}
			style={
				color
					? {
							background: `linear-gradient(120deg, #00000000 0%, ${color}35 50%, ${color}BF 120%), linear-gradient(160deg, #00000000 0%, ${color}30 60%, ${color}BF 120%)`,
						}
					: undefined
			}
		>
			<div
				className={cn("flex items-center pt-20 2xl:pt-24", {
					"gap-8": !rounded,
					"gap-6": rounded,
				})}
			>
				<img
					className={cn("w-[220px] 2xl:w-[280px]", {
						"rounded-full": rounded,
						"rounded-md": !rounded,
					})}
					src={data.img || undefined}
					alt={data.name}
				/>
				<div>
					{type && <p>{type}</p>}
					<h1>{data.name}</h1>
					<p className={cn("mb-4 text-lg text-zinc-500", {
								"text-zinc-100": color,
							})}>{subTitle}</p>
					<Link href={data.spotifyUrl} className="inline-block">
						<SpotifyIcon
							className={cn("text-zinc-600 hover:text-spotify", {
								"text-zinc-300": color,
							})}
							size={30}
						/>
					</Link>
				</div>
			</div>
		</div>
	);
}
