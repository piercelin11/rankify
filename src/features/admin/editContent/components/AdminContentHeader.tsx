"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { ReactNode } from "react";
import { AlbumData, ArtistData } from "@/types/data";
import Image from "next/image";
import { SpotifyIcon } from "@/components/icons/LogoIcons";

type ContentHeaderProps = {
	data?: AlbumData | ArtistData;
	rounded?: boolean;
	type?: string;
	children?: ReactNode;
	subTitleContent?: ReactNode;
};

const AdminContentHeader = React.memo(function ContentHeader({
	data,
	rounded = false,
	type,
	children,
	subTitleContent,
}: ContentHeaderProps) {
	return (
		<section
			className="p-8 2xl:p-14 border-b border-muted"
		>
				<div className="flex items-center gap-6">
					<div
						className={cn(
							"relative min-h-[160px] min-w-[160px] overflow-hidden bg-neutral-900 lg:min-h-[200px] lg:min-w-[200px] 2xl:min-h-[240px] 2xl:min-w-[240px]",
							{
								"rounded-full": rounded,
								"rounded-xl": !rounded,
							}
						)}
					>
						{data?.img && (
							<Image
								fill
								priority
								src={data?.img}
								alt={`${data?.name} profile`}
								sizes="(min-width: 1536px) 300px, 220px"
							/>
						)}
					</div>
					{data && (
						<div className="space-y-1">
							{type && <p>{type}</p>}
							<h1 className="">{data?.name}</h1>
							<div className="text-description group mb-4 flex items-center gap-2 text-secondary-foreground">
								<Link href={data?.spotifyUrl || ""} className="inline-block">
									<SpotifyIcon
										className={"text-secondary-foreground hover:text-spotify"}
										size={30}
									/>
								</Link>
								{subTitleContent}
							</div>
						</div>
					)}
					<div className="ml-auto self-start">{children}</div>
				</div>
		</section>
	);
});

export default AdminContentHeader;
