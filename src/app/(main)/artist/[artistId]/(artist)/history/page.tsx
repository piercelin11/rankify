import { redirect } from "next/navigation";
import { getUserSession } from "@/../auth";
import { getLatestArtistRankingSubmissions } from "@/db/ranking";

type pageProps = {
	params: Promise<{ artistId: string }>;
};

export default async function HistoryPage({ params }: pageProps) {
	const { artistId } = await params;
	const { id: userId } = await getUserSession();

	const latestSession = await getLatestArtistRankingSubmissions({
		artistId,
		userId,
	});

	if (!latestSession) {
		redirect(`/artist/${artistId}/my-stats`);
	}

	redirect(`/artist/${artistId}/my-stats/${latestSession.id}`);
}