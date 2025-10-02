import { getArtistById } from "@/db/artist";
import SorterHeader from "@/features/sorter/components/SorterHeader";
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
		<div className="flex h-screen flex-col overflow-hidden">
			<SorterHeader artist={artist} />
			<div className="container overflow-auto">{children}</div>
		</div>
	);
}
