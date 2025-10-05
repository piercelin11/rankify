"use client";

import { useEffect, useState } from "react";
import { useStickyState } from "@/lib/hooks/useStickyState";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ArtistData } from "@/types/data";
import BlurredImageBackground from "@/components/backgrounds/BlurredImageBackground";
import ContentHeader from "@/components/presentation/ContentHeader";
import ArtistNavigationHeader from "@/components/layout/ArtistNavigationHeader";
import { CreateRankingButton } from "@/features/sorter/components/CreateRankingButton";

type CollapsibleArtistHeaderProps = {
	artist: ArtistData;
	children: React.ReactNode;
};

export default function CollapsibleArtistHeader({
	artist,
	children,
}: CollapsibleArtistHeaderProps) {
	const [headerState, setHeaderState] = useState<"expanded" | "collapsed">(
		"expanded"
	);
	const { state: sidebarState, isMobile } = useSidebar();

	const { isStuck, sentinelRef } = useStickyState({
		rootMargin: "-150px",
		threshold: 0,
	});

	useEffect(() => {
		const newState = isStuck ? "collapsed" : "expanded";
		setHeaderState(newState);
	}, [isStuck]);

	const getLeftPosition = () => {
		if (isMobile) return "left-0";
		return sidebarState === "expanded" ? "left-[16rem]" : "left-[4.5rem]";
	};

	return (
		<>
			{/* 收合版本的 Header - 固定在頂部 */}
			<div
				className={cn(
					"fixed right-0 top-0 z-50 flex items-center justify-between gap-2 border-b bg-accent/90 px-content py-4 backdrop-blur transition-all duration-200 ease-linear supports-[backdrop-filter]:bg-accent/90",
					getLeftPosition(),
					headerState === "collapsed"
						? "opacity-100"
						: "pointer-events-none opacity-0"
				)}
			>
				<p className="text-2xl font-semibold">{artist.name}</p>
				<CreateRankingButton artistId={artist.id} variant="full" />
			</div>

			<BlurredImageBackground src={artist.img || ""} />

			{/* 原始版本的 Header - 正常文檔流 */}
			<ArtistNavigationHeader artist={artist} />
			<ContentHeader
				data={artist}
				subTitleContent={<p>{artist.spotifyFollowers} followers</p>}
				rounded
				type="Artist"
			/>
			<div ref={sentinelRef} className="mb-10" />

			{children}
		</>
	);
}
