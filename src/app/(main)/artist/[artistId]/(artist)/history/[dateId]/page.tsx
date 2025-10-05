import { redirect } from "next/navigation";
import { ArtistViewParamsSchema } from "@/lib/schemas/artist";

type pageProps = {
	params: Promise<{ artistId: string; dateId: string }>;
	searchParams: Promise<{ view?: string }>;
};

export default async function HistoryDatePage({
	params,
	searchParams,
}: pageProps) {
	const { artistId, dateId } = await params;
	const { view: rawView } = await searchParams;

	const view = ArtistViewParamsSchema.parse(rawView);
	const queryString = rawView ? `?view=${view}` : "";

	redirect(`/artist/${artistId}/my-stats/${dateId}${queryString}`);
}