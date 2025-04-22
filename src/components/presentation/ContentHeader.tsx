import { cn } from "@/lib/cn";
import Link from "next/link";
import React, { ReactNode } from "react";
import { SpotifyIcon } from "../icons/LogoIcons";
import { AlbumData, ArtistData, TrackData } from "@/types/data";

type ContentHeaderProps = {
	data?: AlbumData | ArtistData | TrackData;
	subTitle?: string | ReactNode;
	rounded?: boolean;
	type?: string;
	color?: string | null;
	children?: ReactNode;
};

export default function ContentHeader({
	data,
	subTitle,
	rounded = false,
	type,
	color,
	children,
}: ContentHeaderProps) {
	return (
		<>
			<div
				className={cn("pt-20 2xl:pt-24", {
					"bg-neutral-900": !color,
					"pt-10 2xl:pt-12": children,
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
					className={cn("p-8 2xl:p-14", {
						"space-y-4": children,
					})}
				>
					{children}
					<div className="flex items-center gap-6">
						<img
							className={cn("w-full sm:w-[220px] 2xl:w-[280px]", {
								"rounded-full": rounded,
								"rounded-md": !rounded,
							})}
							src={data?.img || "/pic/placeholder.jpg"}
							alt={data?.name}
						/>
						{data && (
							<ContentHeaderInfo
								data={data}
								subTitle={subTitle}
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
					subTitle={subTitle}
					type={type}
					color={color}
				/>
			)}
		</>
	);
}

function ContentHeaderInfo({
	data,
	subTitle,
	type,
	color,
}: ContentHeaderProps) {
	return (
		<div className="hidden sm:block">
			{type && <p>{type}</p>}
			<h1 className="text-display">{data?.name}</h1>
			<p
				className={cn("mb-4 text-lg text-neutral-500", {
					"text-neutral-100": color,
				})}
			>
				{subTitle}
			</p>
			<Link href={data?.spotifyUrl || ""} className="inline-block">
				<SpotifyIcon
					className={cn("text-neutral-600 hover:text-spotify", {
						"text-neutral-300": color,
					})}
					size={30}
				/>
			</Link>
		</div>
	);
}

function ContentHeaderInfoMobileInfo({
	data,
	subTitle,
	type,
	color,
}: ContentHeaderProps) {
	return (
		<div className="mx-8 mt-8 border-b border-neutral-750 pb-6 sm:hidden">
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
				<p
					className={cn("text-lg text-neutral-500", {
						"text-neutral-100": color,
					})}
				>
					{subTitle}
				</p>
			</div>
		</div>
	);
}
