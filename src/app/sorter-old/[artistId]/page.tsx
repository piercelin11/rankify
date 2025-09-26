import getTracksByArtist from "@/lib/database/data/getTracksByArtist";
import getRankingDraft from "@/lib/database/user/getRankingDraft";

import { getUserSession } from "@/../auth";
import getAlbumsByArtist from "@/lib/database/data/getAlbumsByArtist";
import SorterPage from "@/features/sorter/components/SorterPage";

export default async function page({
	params,
	searchParams,
}: {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ type?: string; albumId?: string }>;
}) {
	const { id: userId } = await getUserSession();
	const artistId = (await params).artistId;
	const { type, albumId } = await searchParams;
	const rankingType = type === "album" ? "album" : "artist";

	const tracks = await getTracksByArtist(artistId);
	const albums = await getAlbumsByArtist(artistId);
	const draft = await getRankingDraft({
		artistId,
		userId,
		type: rankingType === "album" ? "ALBUM" : "ARTIST",
		albumId
	});

	return <SorterPage albums={albums} tracks={tracks} draft={draft} rankingType={rankingType} albumId={albumId} />;
}
