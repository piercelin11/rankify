import ContentHeader from "@/components/presentation/ContentHeader";
import ContentWrapper from "@/components/layout/ContentWrapper";
import getArtistById from "@/lib/database/data/getArtistById";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";
import Tabs from "@/components/navigation/Tabs";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import { headers } from "next/headers";
import { getArtistTabOptions } from "@/config/menuData";

type LayoutProps = {
	params: Promise<{ artistId: string }>;
	children: ReactNode;
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

async function Header({ params }: { params: Promise<{ artistId: string }> }) {
	const artistId = (await params).artistId;
	const artist = await getArtistById(artistId);
	const tabOptions = getArtistTabOptions(artistId);

	const headerList = headers();
	const pathname = (await headerList).get("x-current-path");
	const activePathname = pathname?.split("/")[3];

	if (!artist) notFound();

	return (
		<>
			<ContentHeader
				data={artist}
				subTitleContent={
					<p className="text-description">
						`${artist.spotifyFollowers} followers`
					</p>
				}
				rounded
				type="Artist"
			>
				<div className="flex">
					<div className="ml-auto flex gap-4">
						<Tabs activeId={activePathname} options={tabOptions} />
						<Link href={`/sorter/${artistId}`}>
							<div className="aspect-square rounded-full bg-primary-500 p-4 text-neutral-950 hover:bg-neutral-100">
								<PlusIcon width={16} height={16} />
							</div>
						</Link>
					</div>
				</div>
			</ContentHeader>
		</>
	);
}
