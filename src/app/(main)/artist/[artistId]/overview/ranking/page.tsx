import React from "react";
import { auth } from "@/../auth";
import InfoHeader from "@/components/display/InfoHeader";
import getTrackRankings from "@/lib/data/ranking/overall/getTrackRankings";
import getArtistById from "@/lib/data/getArtistById";
import { notFound } from "next/navigation";
import ContentWrapper from "@/components/general/ContentWrapper";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import RankingListItem from "@/components/ranking/RankingListItem";

export default async function ArtistRankingPage({
	params,
}: {
	params: Promise<{ artistId: string }>;
}) {
	const artistId = (await params).artistId;

	const session = await auth();
	if (!session) return null;

	const overllTracksRankings = await getTrackRankings(
		artistId,
		session.user.id
	);

	return (
		<>
			{overllTracksRankings.map((track) => (
				<RankingListItem data={track} key={track.id} />
			))}
			<div className="flex w-full justify-center py-6">
				<Link
					className="item-center flex gap-2 text-zinc-500 hover:text-zinc-100"
					href={`/artist/${artistId}`}
				>
					<ArrowLeftIcon className="self-center" />
					Back
				</Link>
			</div>
		</>
	);
}
