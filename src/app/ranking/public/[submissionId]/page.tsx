import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/db/client";
import { Button } from "@/components/ui/button";

type PageProps = {
	params: Promise<{ submissionId: string }>;
};

export default async function PublicRankingPage({ params }: PageProps) {
	const { submissionId } = await params;

	// 查詢 submission 資料
	const submission = await db.rankingSubmission.findUnique({
		where: { id: submissionId, status: "COMPLETED" },
		include: {
			user: { select: { name: true, image: true } },
			artist: { select: { id: true, name: true } },
			album: { select: { id: true, name: true, img: true } },
			trackRanks: {
				orderBy: { rank: "asc" },
				include: {
					track: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			},
		},
	});

	if (!submission) {
		notFound();
	}

	return (
		<div className="container max-w-3xl p-content space-y-8">
			{/* Header */}
			<div className="space-y-4">
				<div className="flex items-center gap-4">
					{submission.user.image && (
						<Image
							src={submission.user.image}
							alt={submission.user.name ?? "User"}
							width={64}
							height={64}
							className="rounded-full"
						/>
					)}
					<div>
						<h1 className="text-3xl font-bold">
							{submission.user.name}&apos;s Ranking
						</h1>
						<p className="text-muted-foreground">
							{submission.artist.name}
							{submission.album && ` / ${submission.album.name}`}
						</p>
					</div>
				</div>

				{/* 專輯封面 */}
				{submission.album?.img && (
					<div className="relative w-48 h-48 mx-auto rounded overflow-hidden">
						<Image
							src={submission.album.img}
							alt={submission.album.name}
							fill
							className="object-cover"
						/>
					</div>
				)}
			</div>

			{/* 排名列表 */}
			<div className="space-y-2">
				<h2 className="text-xl font-semibold">Track Rankings</h2>
				<div className="space-y-1">
					{submission.trackRanks.map((ranking) => (
						<div
							key={ranking.id}
							className="flex items-center gap-3 p-3 rounded-lg bg-card border"
						>
							<span className="text-2xl font-bold w-8 text-muted-foreground">
								{ranking.rank}
							</span>
							<span className="flex-1">{ranking.track.name}</span>
						</div>
					))}
				</div>
			</div>

			{/* 底部 CTA */}
			<div className="sticky bottom-0 p-4 bg-background/80 backdrop-blur-sm border-t">
				<Link href={`/sorter/album/${submission.albumId}`} className="block">
					<Button size="lg" className="w-full">
						⚡ 我也要排這張專輯
					</Button>
				</Link>
			</div>
		</div>
	);
}
