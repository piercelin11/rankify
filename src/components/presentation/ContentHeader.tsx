"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import React, { ReactNode, useEffect } from "react";
import { SpotifyIcon } from "../icons/LogoIcons";
import { AlbumData, ArtistData, TrackData } from "@/types/data";
import Image from "next/image";

type ContentHeaderProps = {
	data?: AlbumData | ArtistData | TrackData;
	subTitleContent?: ReactNode;
	rounded?: boolean;
	type?: string;
	color?: string | null;
	children?: ReactNode;
};

const ContentHeader = React.memo(function ContentHeader({
	data,
	subTitleContent,
	rounded = false,
	type,
	color,
	children,
}: ContentHeaderProps) {
	return (
		<section>
			<div
				className={cn("pt-20 2xl:pt-24", {
					"pt-10 2xl:pt-12": children,
				})}
			>
				<div
					className={cn("px-8 py-8 2xl:px-14 2xl:py-14", {
						"space-y-4": children,
					})}
				>
					{children}
					<div className="flex items-center gap-6">
						<div
							className={cn(
								"relative min-h-[220px] min-w-[220px] drop-shadow-2xl lg:min-h-[260px] lg:min-w-[260px] 2xl:min-h-[300px] 2xl:min-w-[300px]"
							)}
						>
							{data?.img && (
								<Image
									className={cn("border border-neutral-500/20", {
										"rounded-full": rounded,
										"rounded-4xl": !rounded,
									})}
									fill
									priority
									src={data?.img}
									alt={`${data?.name} profile`}
									sizes="(min-width: 1536px) 300px, 220px"
								/>
							)}
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
				</div>
			</div>
		</section>
	);
});

function ContentHeaderInfo({
	data,
	subTitleContent,
	type,
	color,
}: ContentHeaderProps) {
	return (
		<div className={cn("space-y-2")}>
			{type && <p>{type}</p>}
			<h1 className={cn("text-display")}>{data?.name}</h1>
			<div
				className={cn("text-description mb-4 flex items-center gap-2", {
					"text-neutral-100": color,
				})}
			>
				<Link href={data?.spotifyUrl || ""} className="inline-block">
					<SpotifyIcon
						className={cn("text-neutral-600 hover:text-spotify", {
							"text-neutral-300": color,
						})}
						size={30}
					/>
				</Link>
				{subTitleContent}
			</div>
		</div>
	);
}

export default ContentHeader;
