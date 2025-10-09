"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

// ✅ Discriminated Union: 編譯時期保證型別安全
type CreateRankingButtonProps =
	| {
			type?: "ARTIST";
			artistId: string;
			albumId?: never;
			variant?: "full" | "icon";
			className?: string;
	  }
	| {
			type: "ALBUM";
			artistId: string;
			albumId: string;
			variant?: "full" | "icon";
			className?: string;
	  };

export function CreateRankingButton({
	artistId,
	variant = "full",
	type = "ARTIST",
	albumId,
	className,
}: CreateRankingButtonProps) {
	// 計算路由（型別系統已保證安全，不需 runtime 檢查）
	const href = useMemo(() => {
		if (type === "ALBUM") {
			return `/sorter/album/${albumId}`;
		}
		return `/sorter/artist/${artistId}`;
	}, [type, albumId, artistId]);

	if (variant === "icon") {
		return (
			<Button
				size="icon"
				className={className || "size-10 rounded-full"}
				asChild
			>
				<Link href={href}>
					<Plus className="h-8 w-8 text-primary-foreground" />
				</Link>
			</Button>
		);
	}

	return (
		<Button
			className={className || "h-10 rounded-full text-sm"}
			asChild
		>
			<Link href={href}>
				<Plus className="h-8 w-8 text-primary-foreground" />
				Create
			</Link>
		</Button>
	);
}
