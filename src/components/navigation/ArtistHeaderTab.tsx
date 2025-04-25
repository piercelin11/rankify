"use client";

import React, { useEffect } from "react";
import Tabs from "./Tabs";
import { getArtistTabOptions } from "@/config/menuData";
import { usePathname } from "next/navigation";

type ArtistHeaderTabProps = {
	artistId: string;
};

export default function ArtistHeaderTab({ artistId }: ArtistHeaderTabProps) {
	const tabOptions = getArtistTabOptions(artistId);
	const pathname = usePathname();
	const activePathname = pathname?.split("/")[3];

	const isRankingPage = pathname?.includes("ranking");

	return (
		<>
			{!isRankingPage && (
				<div className="flex">
					<div className="ml-auto">
						<Tabs activeId={activePathname} options={tabOptions} />
					</div>
				</div>
			)}
		</>
	);
}
