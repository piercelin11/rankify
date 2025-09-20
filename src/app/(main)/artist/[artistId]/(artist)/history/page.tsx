import { redirect } from "next/navigation";
import { getUserSession } from "@/../auth";
import { getLatestArtistRankingSession } from "@/db/ranking";

type pageProps = {
	params: Promise<{ artistId: string }>;
};

export default async function HistoryPage({ params }: pageProps) {
	const { artistId } = await params;
	const { id: userId } = await getUserSession();

	const latestSession = await getLatestArtistRankingSession(artistId, userId);

	if (!latestSession) {
		redirect(`/artist/${artistId}/overview`);
	}

	redirect(`/artist/${artistId}/history/${latestSession.id}`);
}