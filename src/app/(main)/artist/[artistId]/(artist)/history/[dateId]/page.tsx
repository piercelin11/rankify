import { redirect } from "next/navigation";
import { isValidArtistView } from "@/types/artist";

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

	// 驗證 view 參數,無效則重定向到乾淨的 URL
	const queryString =
		view && isValidArtistView(view) ? `?view=${view}` : "";

	redirect(`/artist/${artistId}/my-stats/${dateId}${queryString}`);
}