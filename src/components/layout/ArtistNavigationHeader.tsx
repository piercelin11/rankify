"use client";

import { usePathname } from "next/navigation";
import AnimatedSegmentControl from "@/components/navigation/AnimatedSegmentControl";
import SimpleBreadcrumb, {
	createBreadcrumbItems,
} from "@/components/navigation/SimpleBreadcrumb";
import { ArtistData } from "@/types/data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getArtistTabOptions } from "@/config/artistTabs";

type ArtistNavigationHeaderProps = {
	artist: ArtistData;
};

export default function ArtistNavigationHeader({ artist }: ArtistNavigationHeaderProps) {
	const pathname = usePathname();
	const tabOptions = getArtistTabOptions(artist.id);
	const breadCrumbItems = createBreadcrumbItems([
		{
			label: "Home",
			href: "/",
		},
		{
			label: artist.name,
		},
	]);

	const isRankingPage = pathname.includes("/ranking");
	const currentTab = pathname.split("/")[3];

	return (
		<div className="px-content pt-content md:flex md:justify-between">
			<SimpleBreadcrumb items={breadCrumbItems} />
			<div className="flex gap-4">
				<AnimatedSegmentControl
					size="md"
					options={tabOptions.map((option) => ({
						...option,
						value: option.id,
					}))}
					value={currentTab}
				/>
				{isRankingPage ? (
					<Button className="h-10 rounded-full text-sm">
						<Plus className="h-8 w-8 text-primary-foreground" />
						Create
					</Button>
				) : (
					<Button size="icon" className="size-10 rounded-full">
						<Plus className="h-8 w-8 text-primary-foreground" />
					</Button>
				)}
			</div>
		</div>
	);
}