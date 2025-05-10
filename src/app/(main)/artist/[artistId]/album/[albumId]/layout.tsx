import ContentHeader from "@/components/presentation/ContentHeader";
import ContentWrapper from "@/components/layout/ContentWrapper";
import getAlbumById from "@/lib/database/data/getAlbumById";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import BlurredImageBackground from "@/components/backgrounds/BlurredImageBackground";
import { AlbumData, ArtistData } from "@/types/data.types";
import Link from "next/link";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import Scroll from "@/components/layout/Scroll";

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
			<Scroll />
			<Suspense fallback={<ContentHeader />}>
				<Header params={params} />
			</Suspense>
			<Suspense fallback={<LoadingAnimation />}>
				<ContentWrapper className="space-y-10 2xl:space-y-20">
					{children}
				</ContentWrapper>
			</Suspense>
		</>
	);
}

async function Header({ params }: Omit<LayoutProps, "children">) {
	const albumId = (await params).albumId;
	const albumData = await getAlbumById(albumId);

	if (!albumData) notFound();

	return (
		<>
			<ContentHeader
				data={albumData}
				subTitleContent={<AlbumPageSubtitleContent albumData={albumData} />}
				type="Album"
				color={albumData.color}
			/>
			<BlurredImageBackground src={albumData.img ?? ""} />
		</>
	);
}

function AlbumPageSubtitleContent({
	albumData,
}: {
	albumData: AlbumData & { artist: ArtistData };
}) {
	return (
		<>
			<div className="flex items-center gap-1">
				<Image
					className="rounded-full"
					width={30}
					height={30}
					src={albumData.artist.img ?? ""}
					alt={albumData.artist.name}
					sizes="30px"
				/>
				<Link
					className="font-bold hover:underline"
					href={`/artist/${albumData.artist.id}`}
				>
					{albumData.artist.name}
				</Link>
			</div>
		</>
	);
}
