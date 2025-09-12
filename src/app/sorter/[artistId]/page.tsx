import getTracksByArtist from "@/lib/database/data/getTracksByArtist";
import getRankingDraft from "@/lib/database/user/getRankingDraft";

import { getUserSession } from "@/../auth";
import getAlbumsByArtist from "@/lib/database/data/getAlbumsByArtist";
import SorterPage from "@/features/sorter/components/SorterPage";

export default async function page({
	params,
}: {
	params: Promise<{ artistId: string }>;
}) {
	const { id: userId } = await getUserSession();
	const artistId = (await params).artistId;
	const tracks = await getTracksByArtist(artistId);
	const albums = await getAlbumsByArtist(artistId);
	const draft = await getRankingDraft({ artistId, userId });

	return <SorterPage albums={albums} tracks={tracks} draft={draft}  />;
}
