import React from "react";
import { auth } from "@/../auth";
import getTrackRankings from "@/lib/data/ranking/overall/getTrackRankings";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import RankingListItem from "@/components/ranking/RankingListItem";
import { getAlbumRankings } from "@/lib/data/ranking/overall/getAlbumRankings";
import DoubleBarChart from "@/components/chart/DoubleBarChart";
import NavigationTabs from "@/components/menu/NavigationTabs";
import DropDownMenu from "@/components/menu/DropDownMenu";

export default async function ArtistPage({
	params,
	searchParams,
}: {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const artistId = (await params).artistId;
	const query = await searchParams;

	const session = await auth();
	if (!session) return null;

	const userId = session.user.id;

	const trackRankings = await getTrackRankings({ artistId, userId, take: 5, time: query });
	const albumRankings = await getAlbumRankings({ artistId, userId, time: query });

	const navMenuData = [
		{
			label: "Global Trend",
			link: `/artist/${artistId}/trend`,
		},
		{
			label: "My Overview",
			link: `/artist/${artistId}/overview`,
		},
		{
			label: "Session History",
			link: `/artist/${artistId}/history`,
		},
	];

	const dropDownData = [
		{
			label: "past month",
			link: `?${new URLSearchParams({ months: "1" })}`,
		},
		{
			label: "6 months",
			link: `?${new URLSearchParams({ months: "6" })}`,
		},
		{
			label: "past year",
			link: `?${new URLSearchParams({ years: "1" })}`,
		},
		{
			label: "past 2 years",
			link: `?${new URLSearchParams({ years: "2" })}`,
		},
		{
			label: "lifetime",
			link: `?${new URLSearchParams()}`,
		},
	];

	return (
		<>
			<div className="flex justify-between">
				<DropDownMenu menuData={dropDownData} />
				<NavigationTabs menuData={navMenuData} />
			</div>
			<div className="space-y-6">
				<h3>Track Rankings</h3>
				<div>
					{trackRankings.map((track) => (
						<RankingListItem
							data={track}
							key={track.id}
							length={trackRankings.length}
						/>
					))}
				</div>
				<div className="flex w-full justify-center">
					<Link
						className="flex gap-2 text-zinc-500 hover:text-zinc-100"
						href={`/artist/${artistId}/ranking`}
					>
						View All Rankings
						<ArrowTopRightIcon className="self-center" />
					</Link>
				</div>
			</div>
			<div className="space-y-6">
				<h3>Album Points</h3>
				<div className="p-5">
					<DoubleBarChart
						data={{
							labels: albumRankings.map((album) => album.name),
							mainData: albumRankings.map((album) => album.totalPoints),
							subData: albumRankings.map((album) => album.rawTotalPoints),
							color: albumRankings.map((album) => album.color),
						}}
					/>
				</div>
			</div>
		</>
	);
}
