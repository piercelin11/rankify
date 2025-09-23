"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Music, Album } from "lucide-react";

type RankingTypeSelectionModalProps = {
	artistId: string;
	onClose: () => void;
};

export function RankingTypeSelectionModal({
	artistId,
	onClose,
}: RankingTypeSelectionModalProps) {
	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				選擇你想要進行的排名類型
			</p>

			<div className="space-y-3">
				<Link href={`/sorter/${artistId}?type=artist`} onClick={onClose}>
					<Button
						className="w-full justify-start gap-3 h-auto py-4"
						variant="outline"
					>
						<Music className="h-5 w-5" />
						<div className="text-left">
							<div className="font-medium">排名所有歌曲</div>
							<div className="text-sm text-muted-foreground">
								對該歌手的所有歌曲進行排名
							</div>
						</div>
					</Button>
				</Link>

				<Link href={`/sorter/${artistId}?type=album`} onClick={onClose}>
					<Button
						className="w-full justify-start gap-3 h-auto py-4"
						variant="outline"
					>
						<Album className="h-5 w-5" />
						<div className="text-left">
							<div className="font-medium">排名專輯歌曲</div>
							<div className="text-sm text-muted-foreground">
								選擇專輯並排名其中的歌曲
							</div>
						</div>
					</Button>
				</Link>
			</div>
		</div>
	);
}