import { redirect } from "next/navigation";

export default async function page({
	params,
}: {
	params: Promise<{ artistId: string }>;
}) {
	const artistId = (await params).artistId;

	redirect(`/artist/${artistId}/overview/all-time`)
}
