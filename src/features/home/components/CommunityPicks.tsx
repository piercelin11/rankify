import Link from "next/link";
import Image from "next/image";
import { getCommunityPicks } from "@/services/home/getCommunityPicks";
import { PLACEHOLDER_PIC } from "@/constants";

export default async function CommunityPicks() {
	const picks = await getCommunityPicks();

	if (picks.length === 0) {
		return (
			<section className="space-y-3">
				<h2 className="text-2xl font-bold">Trending Results</h2>
				<p className="text-muted-foreground">即將推出</p>
			</section>
		);
	}

	return (
		<section className="space-y-3">
			<h2 className="text-2xl font-bold">Trending Results</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
				{picks.map((pick) => (
					<Link
						key={pick.id}
						href={`/ranking/public/${pick.submissionId}`}
						className="group rounded-lg border bg-card hover:bg-accent transition-colors"
					>
						<div className="p-4 space-y-3">
							{/* 專輯封面 + 使用者頭像 */}
							<div className="relative aspect-square rounded overflow-hidden">
								<Image
									src={pick.albumImg ?? PLACEHOLDER_PIC}
									alt={pick.albumName}
									fill
									className="object-cover"
								/>
								{/* 使用者頭像疊加在右下角 */}
								{pick.userImage && (
									<div className="absolute bottom-2 right-2 w-10 h-10 rounded-full border-2 border-background overflow-hidden">
										<Image
											src={pick.userImage}
											alt={pick.userName ?? "User"}
											fill
											className="object-cover"
										/>
									</div>
								)}
							</div>

							{/* 標題 */}
							<div>
								<p className="font-medium line-clamp-2 text-sm">{pick.title}</p>
							</div>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
