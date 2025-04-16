import SorterHeader from "@/components/sorter/SorterHeader";
import getArtistById from "@/lib/database/data/getArtistById";
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
		<div className="flex h-screen flex-col overflow-x-hidden">
			<SorterHeader artist={artist} />
			<div className="flex px-4 h-full">
				<div className="container m-auto">{children}</div>
			</div>
		</div>
	);
}
