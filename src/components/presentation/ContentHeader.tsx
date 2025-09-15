"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode } from "react";
import { SpotifyIcon } from "../icons/LogoIcons";
import { AlbumData, ArtistData, TrackData } from "@/types/data";
import Image from "next/image";
import { PLACEHOLDER_PIC } from "@/constants";

type ContentHeaderProps = {
	data?: AlbumData | ArtistData | TrackData;
	subTitleContent?: ReactNode;
	rounded?: boolean;
	type?: string;
	color?: string | null;
};

export default function ContentHeader({
	data,
	subTitleContent,
	rounded = false,
	type,
	color,
}: ContentHeaderProps) {
	return (
			<section className="p-content">
				<div className="flex items-center gap-6">
					<div
						className={cn(
							"relative h-[220px] w-[220px] overflow-hidden bg-neutral-900 drop-shadow-2xl",
							{
								"rounded-full": rounded,
								"rounded-4xl": !rounded,
							}
						)}
					>
						<Image
							fill
							priority
							src={data?.img || PLACEHOLDER_PIC}
							alt={`${data?.name} profile`}
							sizes="(min-width: 1536px) 300px, 220px"
						/>
					</div>
					{data && (
						<ContentHeaderInfo
							data={data}
							subTitleContent={subTitleContent}
							type={type}
							color={color}
						/>
					)}
				</div>
			</section>
	);
}

function ContentHeaderInfo({
	data,
	subTitleContent,
	type,
}: ContentHeaderProps) {
	return (
		<div className="space-y-2">
			{type && <p>{type}</p>}
			<h1 className="text-display">{data?.name}</h1>
			<div className="text-description group mb-4 flex items-center gap-2 text-neutral-400">
				<Link href={data?.spotifyUrl || ""} className="inline-block">
					<SpotifyIcon
						className="text-neutral-400 hover:text-spotify"
						size={30}
					/>
				</Link>
				{subTitleContent}
			</div>
		</div>
	);
}
