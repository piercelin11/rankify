"use client";

import React from "react";
import Tabs from "../../../../../../components/navigation/Tabs";
import { getArtistTabOptions } from "@/config/navData";
import { usePathname } from "next/navigation";
import ContentHeader from "../../../../../../components/presentation/ContentHeader";
import { ArtistData } from "@/types/data";

type ArtistHeaderProps = {
	artistData: ArtistData;
};

const ArtistHeader = React.memo(function ArtistHeader({
	artistData,
}: ArtistHeaderProps) {
	const tabOptions = getArtistTabOptions(artistData.id);
	const pathname = usePathname();
	const activePathname = pathname?.split("/")[3];

	const isRankingPage = pathname?.includes("ranking");

	return (
		<>
			{!isRankingPage && (
				<ContentHeader
					data={artistData}
					subTitleContent={
						<p className="text-description text-neutral-300/40">
							{artistData.spotifyFollowers} followers
						</p>
					}
					rounded
					type="Artist"
				>
					<div className="flex">
						<div className="ml-auto">
							<Tabs activeId={activePathname} options={tabOptions} />
						</div>
					</div>
				</ContentHeader>
			)}
		</>
	);
});

export default ArtistHeader;
