import ContentHeader from "@/components/presentation/ContentHeader";
import ContentWrapper from "@/components/layout/ContentWrapper";
import getArtistById from "@/lib/database/data/getArtistById";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type LayoutProps = {
	params: Promise<{ artistId: string }>;
	children: React.ReactNode;
};

export default async function MainLayout({ params, children }: LayoutProps) {
	return (
		<>
			<Suspense fallback={<ContentHeader />}>
				<Header params={params} />
			</Suspense>
			<ContentWrapper className="space-y-10">{children}</ContentWrapper>
		</>
	);
}

async function Header({ params }: Omit<LayoutProps, "children">) {
	const artistId = (await params).artistId;
	const artist = await getArtistById(artistId);

	if (!artist) notFound();

	return (
		<ContentHeader
			data={artist}
			subTitle={`${artist.spotifyFollowers} followers`}
			rounded
			type="Artist"
		/>
	);
}
