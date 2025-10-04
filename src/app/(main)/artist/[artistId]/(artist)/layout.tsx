import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { getArtistById } from "@/db/artist";
import CollapsibleArtistHeader from "@/components/layout/CollapsibleArtistHeader";

type LayoutProps = {
	params: Promise<{ artistId: string }>;
	children: ReactNode;
};

export default async function MainLayout({ params, children }: LayoutProps) {
	const artistId = (await params).artistId;
	const artist = await getArtistById({ artistId });

	if (!artist) notFound();
	return (
		<CollapsibleArtistHeader artist={artist}>
			{children}
		</CollapsibleArtistHeader>
	);
}
