import { redirect } from "next/navigation";

type pageProps = {
	params: Promise<{ artistId: string; dateId: string }>;
	searchParams: Promise<{ view?: string }>;
};

export default async function HistoryDatePage({
	params,
	searchParams,
}: pageProps) {
	const { artistId, dateId } = await params;
	const { view } = await searchParams;

	// Redirect 到新路由，保留 view 參數
	const queryString = view ? `?view=${view}` : "";
	redirect(`/artist/${artistId}/my-stats/${dateId}${queryString}`);
}