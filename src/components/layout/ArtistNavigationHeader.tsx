"use client";

import { usePathname } from "next/navigation";
import AnimatedSegmentControl from "@/components/navigation/AnimatedSegmentControl";
import { ArtistData } from "@/types/data";
import { CreateRankingButton } from "@/features/sorter/components/CreateRankingButton";
import { useSession } from "next-auth/react";

type ArtistNavigationHeaderProps = {
	artist: ArtistData;
};

export default function ArtistNavigationHeader({
	artist,
}: ArtistNavigationHeaderProps) {
	const pathname = usePathname();
	const session = useSession();
	const mainTab =
		session.status === "authenticated" ? "My Stats" : "Discogrphy";
	const tabOptions = [
		{
			id: mainTab.toLowerCase().replace(" ", "-"),
			label: mainTab,
			href: `/artist/${artist.id}`,
		},
		{
			id: "community",
			label: "Community",

			href: `/artist/${artist.id}/community`,
		},
	];

	const isRankingPage = pathname.includes("/ranking");
	const currentTab =
		pathname.split("/")[3] ?? mainTab.toLowerCase().replace(" ", "-");

	return (
		<div className="px-content pt-content md:flex md:justify-end">
			<div className="flex gap-4">
				<AnimatedSegmentControl
					size="md"
					options={tabOptions.map((option) => ({
						...option,
						value: option.id,
					}))}
					value={currentTab}
				/>
				<CreateRankingButton
					artistId={artist.id}
					variant={isRankingPage ? "full" : "icon"}
				/>
			</div>
		</div>
	);
}
