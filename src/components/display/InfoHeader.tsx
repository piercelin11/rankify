import { cn } from "@/lib/cn";
import Link from "next/link";
import React, { ReactNode } from "react";
import SpotifyIcon from "../../../public/icon/SpotifyIcon";
import { AlbumData, ArtistData } from "@/types/data";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

type InfoHeaderProps = {
	data: AlbumData | ArtistData;
	subTitle: string;
	rounded?: boolean;
	type?: string;
};

export default function InfoHeader({
	data,
	subTitle,
	rounded = false,
	type
}: InfoHeaderProps) {
	return (
		<div className="bg-zinc-900/50 p-14">
			<div
				className={cn("flex items-center pt-24", {
					"gap-8": !rounded,
					"gap-6": rounded,
				})}
			>
				<img
					width={220}
					className={rounded ? "rounded-full" : "rounded-md"}
					src={data.img || undefined}
					alt={data.name}
				/>
				<div>
					{type && <p>{type}</p>}
					<h1>{data.name}</h1>
					<p className="mb-4 text-lg text-zinc-500">{subTitle}</p>
					<Link href={data.spotifyUrl}>
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
