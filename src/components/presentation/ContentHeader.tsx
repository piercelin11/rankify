import { cn } from "@/lib/cn";
import Link from "next/link";
import React, { ReactNode } from "react";
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

export default function ContentHeader({
	data,
	subTitleContent,
	rounded = false,
	type,
	color,
	children,
}: ContentHeaderProps) {
	return (
		<>
			<div
				className={cn("pt-20 2xl:pt-24", {
					"pt-10 2xl:pt-12": children,
				})}
			>
				<div
					className={cn("p-8 2xl:p-14", {
						"space-y-4": children,
					})}
				>
					{children}
					<div className="flex items-center gap-6">
						<div className="relative h-[220px] w-[220px] drop-shadow-xl 2xl:h-[280px] 2xl:w-[280px]">
							<Image
								className={cn({
									"rounded-full": rounded,
									"rounded-3xl": !rounded,
								})}
								fill
								src={data?.img || "/pic/placeholder.jpg"}
								alt={`${data?.name} profile`}
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
				</div>
			</div>
			{data && (
				<ContentHeaderInfoMobileInfo
					data={data}
					subTitleContent={subTitleContent}
					type={type}
					color={color}
				/>
			)}
		</>
	);
}

function ContentHeaderInfo({
	data,
	subTitleContent,
	type,
	color,
}: ContentHeaderProps) {
	return (
		<div className="hidden sm:block">
			{type && <p className="mb-2">{type}</p>}
			<h1 className="text-display mb-6">{data?.name}</h1>
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

function ContentHeaderInfoMobileInfo({
	data,
	subTitleContent,
	type,
	color,
}: ContentHeaderProps) {
	return (
		<div className="border-neutral-750 mx-8 mt-8 border-b pb-6 sm:hidden">
			{type && <p>{type}</p>}
			<h1>{data?.name}</h1>
			<div className="flex items-center gap-2">
				<Link href={data?.spotifyUrl || ""} className="inline-block">
					<SpotifyIcon
						className={cn("text-neutral-600 hover:text-spotify", {
							"text-neutral-300": color,
						})}
						size={20}
					/>
				</Link>
				<div
					className={cn("text-description mb-4", {
						"text-neutral-100": color,
					})}
				>
					{subTitleContent}
				</div>
			</div>
		</div>
	);
}
