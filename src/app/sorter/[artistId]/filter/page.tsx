import FilterField from "@/components/sorter/FilterField";
import CheckBox from "@/components/ui/CheckBox";
import { Description } from "@/components/ui/Text";
import getAlbumsByArtist from "@/lib/data/getAlbumsByArtist";
import getArtistById from "@/lib/data/getArtistById";
import getSinglesByArtist from "@/lib/data/getSinglesByArtist";
import { notFound } from "next/navigation";
import React from "react";

export default async function SorterFilterPage({
	params,
}: {
	params: Promise<{ artistId: string }>;
}) {
	const artistId = (await params).artistId;
	const albums = await getAlbumsByArtist(artistId);
	const singles = await getSinglesByArtist(artistId);

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-center">Get Started</h3>
				<Description className="text-center">
					filter out the albums and singles you haven't listen to.
				</Description>
			</div>
			<FilterField albums={albums} singles={singles} />
		</div>
	);
}
