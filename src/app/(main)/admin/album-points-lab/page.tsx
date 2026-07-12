import { requireAdmin } from "@/../auth";
import { PageContainer } from "@/components/layout/PageContainer";
import AlbumPointsLabClient from "@/features/album-points-lab/components/AlbumPointsLabClient";
import { getRawTrackStats } from "@/features/album-points-lab/getRawTrackStats";
import { notFound } from "next/navigation";
import { db } from "@/db/client";

const TEST_ARTIST_IDS = [
	"00FQb4jTyendYWaN8pK0wa",
	"06HL4z0CvFAxyc27GXpf02",
	"6qqNVTkY8uBg9cP3Jd7DAH",
	"26VFTg2z8YR0cCuwLzESi2",
	"66CXWjxzNUsdJxJ2JdwvnR",
];

export default async function AlbumPointsLabPage() {
	const session = await requireAdmin();
	const userId = session.user.id;

	const artists = await db.artist.findMany({
		where: { id: { in: TEST_ARTIST_IDS } },
		select: { id: true, name: true },
	});

	if (artists.length === 0) notFound();

	const orderedArtists = TEST_ARTIST_IDS.map((id) =>
		artists.find((a) => a.id === id)
	).filter((a): a is (typeof artists)[number] => a !== undefined);

	const initialData = await getRawTrackStats(orderedArtists[0].id, userId);
	if (!initialData) notFound();

	return (
		<PageContainer>
			<AlbumPointsLabClient
				artists={orderedArtists}
				initialData={initialData}
				userId={userId}
			/>
		</PageContainer>
	);
}
