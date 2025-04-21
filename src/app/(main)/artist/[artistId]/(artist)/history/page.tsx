import { getUserSession } from "@/../auth";
import { notFound, redirect } from "next/navigation";
import getLatestRankingSession from "@/lib/database/user/getLatestRankingSession";

export default async function page({
	params,
}: {
	params: Promise<{ artistId: string }>;
}) {
	const artistId = (await params).artistId;
    const { id: userId } = await getUserSession();

    const latestSession = await getLatestRankingSession({artistId, userId});

    if (latestSession) {
        redirect(`/artist/${artistId}/history/${latestSession.id}`)
    } else {
        notFound();
    }
}
