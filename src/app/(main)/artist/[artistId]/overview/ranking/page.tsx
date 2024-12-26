import React from "react";
import { auth } from "@/../auth";
import InfoHeader from "@/components/display/InfoHeader";
import getTrackStats from "@/lib/data/ranking/overall/getTrackStats";
import getArtistById from "@/lib/data/getArtistById";
import { notFound } from "next/navigation";
import ContentWrapper from "@/components/general/ContentWrapper";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import RankingListItem from "@/components/ranking/RankingListItem";

export default async function ArtistRankingPage({
	params,
	searchParams,
}: {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ [key: string]: string }>;
}) {
	const artistId = (await params).artistId;
	const query = await searchParams;

	const session = await auth();
	if (!session) return null;

	const userId = session.user.id;

	const tracksRankings = await getTrackStats({
		artistId,
		userId,
		time: query,
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
					href={`/artist/${artistId}/overview`}
				>
					<ArrowLeftIcon className="self-center" />
					Back
				</Link>
			</div>
		</>
	);
}
