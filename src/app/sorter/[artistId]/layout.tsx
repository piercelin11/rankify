import SorterHeader from "@/components/sorter/SorterHeader";
import getArtistById from "@/lib/database/data/getArtistById";
import { SorterContextProvider } from "@/lib/hooks/contexts/SorterContext";
import { notFound } from "next/navigation";
import React, { ReactNode } from "react";

export default async function layout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ artistId: string }>;
}) {
	const artistId = (await params).artistId;
	const artist = await getArtistById(artistId);
	if (!artist) notFound();

	return (
		<SorterContextProvider>
			<div className="h-screen flex flex-col overflow-x-hidden">
				<SorterHeader artist={artist} />
				<div className="flex flex-grow items-center justify-center px-24">
					<div className="w-[1280px] 2xl:w-[1680px]">{children}</div>
				</div>
			</div>
		</SorterContextProvider>
	);
}
