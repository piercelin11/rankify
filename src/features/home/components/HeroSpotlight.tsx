"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useModal } from "@/contexts/ModalContext";
import type { HeroSpotlightType } from "@/services/home/getHeroSpotlight";

type HeroSpotlightProps = {
	data: HeroSpotlightType;
};

export default function HeroSpotlight({ data }: HeroSpotlightProps) {
	const { showAuthGuard } = useModal();

	const handleStartRanking = () => {
		showAuthGuard({
			callbackUrl: `/sorter/album/${data.id}`,
		});
	};

	return (
		<div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg">
			{/* 背景圖片 */}
			{data.img && (
				<div className="absolute inset-0">
					<Image
						src={data.img}
						alt={data.name}
						fill
						className="object-cover brightness-50"
						priority
					/>
				</div>
			)}

			{/* 漸層遮罩 */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

			{/* 內容 */}
			<div className="relative h-full flex flex-col justify-end p-8 md:p-12">
				<h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
					Rank This Album: {data.name}
				</h1>
				<p className="text-lg text-white/80 mb-6">
					Join {data.submissionCount.toLocaleString()}+ fans in ranking this
					masterpiece
				</p>

				<div className="flex flex-col sm:flex-row gap-4">
					<Button
						size="lg"
						onClick={handleStartRanking}
						className="bg-primary hover:bg-primary/90"
					>
						Start Ranking
					</Button>
					<Link href={`/artist/${data.artistId}`}>
						<Button size="lg" variant="outline" className="w-full sm:w-auto">
							View Artist Profile
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
