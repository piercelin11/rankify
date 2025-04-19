import ContentHeader from "@/components/presentation/ContentHeader";
import ContentWrapper from "@/components/general/ContentWrapper";
import getAlbumById from "@/lib/database/data/getAlbumById";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type LayoutProps = {
	params: Promise<{ albumId: string }>;
	children: React.ReactNode;
};

export default async function AlbumPageLayout({
	params,
	children,
}: LayoutProps) {
	return (
		<>
			<Suspense fallback={<ContentHeader />}>
				<Header params={params} />
			</Suspense>
			<ContentWrapper className="space-y-10 2xl:space-y-20">{children}</ContentWrapper>
		</>
	);
}

async function Header({ params }: Omit<LayoutProps, "children">) {
	const albumId = (await params).albumId;
	const albumData = await getAlbumById(albumId);

	if (!albumData) notFound();

	return (
		<ContentHeader
			data={albumData}
			subTitle={albumData.artist.name}
			type="Album"
			color={albumData.color}
		/>
	);
}
