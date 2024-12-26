import React from "react";
import { auth } from "@/../auth";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import RankingListItem from "@/components/ranking/RankingListItem";
import { getTrackRankingHistory } from "@/lib/data/ranking/history/getTrackRankingHistory";
 
export default async function ArtistRankingPage({
	params,
	searchParams
}: {
	params: Promise<{ artistId: string, dateId: string }>;
	searchParams: Promise<{ [key: string]: string }>;
}) {
	const dateId = (await params).dateId;
	const artistId = (await params).artistId;

	const query = await searchParams;

	const session = await auth();
	if (!session) return null;

	const userId = session.user.id;

	const tracksRankings = await getTrackRankingHistory({
		artistId,
		userId,
		dateId,
	});

	return (
		<>	
			<div>
				{tracksRankings.map((track) => (
					<RankingListItem data={track} key={track.id} />
				))}
			</div>
			<div className="flex w-full justify-center">
				<Link
					className="item-center flex gap-2 text-zinc-500 hover:text-zinc-100"
					href={`/artist/${artistId}/history?date=${dateId}`}
				>
					<ArrowLeftIcon className="self-center" />
					Back
				</Link>
			</div>
		</>
	);
}
