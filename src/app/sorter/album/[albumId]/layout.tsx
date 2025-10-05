import { getAlbumById } from "@/db/album";
import SorterHeader from "@/features/sorter/components/SorterHeader";
import { notFound } from "next/navigation";
import React, { ReactNode } from "react";

export default async function layout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ albumId: string }>;
}) {
	const albumId = (await params).albumId;
	const album = await getAlbumById({ albumId });
	if (!album) notFound();

	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<SorterHeader title={album.name} />
			<div className="container overflow-auto">{children}</div>
		</div>
	);
}
