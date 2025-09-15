import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { parsePathname } from "@/lib/utils/url.utils";

type BreadcrumbItemData = {
	label: string;
	href?: string;
	isCurrentPage?: boolean;
};

type AppBreadcrumbProps = {
	pathname: string;
	artistName?: string;
	albumName?: string;
	trackName?: string;
	customItems?: BreadcrumbItemData[];
	className?: string;
};

export default function AppBreadcrumb({
	pathname,
	artistName,
	albumName,
	trackName,
	customItems,
	className,
}: AppBreadcrumbProps) {
	const pathData = parsePathname(pathname);

	// 如果提供了自定義項目，直接使用它們
	if (customItems) {
		return (
			<Breadcrumb className={className}>
				<BreadcrumbList>
					{customItems.map((item, index) => (
						<>
							<BreadcrumbItem key={item.label}>
								{item.isCurrentPage ? (
									<BreadcrumbPage>{item.label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link href={item.href || "#"}>{item.label}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{index < customItems.length - 1 && <BreadcrumbSeparator />}
						</>
					))}
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	// 自動生成 breadcrumb 項目
	const items: BreadcrumbItemData[] = [];

	// 總是包含首頁
	items.push({ label: "首頁", href: "/" });

	// 根據路徑生成項目
	if (pathData.segments.includes("artist")) {
		if (pathData.artistId) {
			items.push({
				label: artistName || pathData.artistId,
				href: `/artist/${pathData.artistId}`,
			});

			// 檢查是否有專輯頁面
			if (pathData.segments.includes("album")) {
				const albumIndex = pathData.segments.indexOf("album");
				const albumId = pathData.segments[albumIndex + 1];

				if (albumId) {
					items.push({
						label: albumName || "專輯",
						href: `/artist/${pathData.artistId}/album/${albumId}`,
					});
				}
			}

			// 檢查是否有歌曲頁面
			if (pathData.segments.includes("track")) {
				const trackIndex = pathData.segments.indexOf("track");
				const trackId = pathData.segments[trackIndex + 1];

				if (trackId) {
					items.push({
						label: trackName || "歌曲",
						href: `/artist/${pathData.artistId}/track/${trackId}`,
					});
				}
			}

			// 檢查其他子頁面
			const lastSegment = pathData.segments[pathData.segments.length - 1];
			const secondLastSegment = pathData.segments[pathData.segments.length - 2];

			if (lastSegment === "overview") {
				items.push({
					label: "概覽",
					isCurrentPage: true,
				});
			} else if (lastSegment === "history") {
				items.push({
					label: "歷史紀錄",
					isCurrentPage: true,
				});
			} else if (lastSegment === "ranking") {
				items.push({
					label: "排行榜",
					isCurrentPage: true,
				});
			} else if (secondLastSegment === "overview" || secondLastSegment === "history") {
				// 處理日期或範圍的情況
				const pageType = secondLastSegment === "overview" ? "概覽" : "歷史紀錄";
				items.push({
					label: pageType,
					href: `/artist/${pathData.artistId}/${secondLastSegment}`,
				});
				items.push({
					label: getDateRangeLabel(lastSegment),
					isCurrentPage: true,
				});
			}
		}
	} else if (pathData.segments.includes("settings")) {
		items.push({
			label: "設定",
			href: "/settings",
		});

		const lastSegment = pathData.segments[pathData.segments.length - 1];
		if (lastSegment === "ranking") {
			items.push({
				label: "排序設定",
				isCurrentPage: true,
			});
		}
	} else if (pathData.segments.includes("sorter")) {
		items.push({
			label: "歌曲排序",
			isCurrentPage: true,
		});
	} else if (pathData.segments.includes("admin")) {
		items.push({
			label: "管理面板",
			href: "/admin",
		});

		// 處理管理面板的子頁面
		if (pathData.segments.includes("artist")) {
			items.push({
				label: "藝術家管理",
				isCurrentPage: pathData.segments.length === 3, // /admin/artist
			});
		} else if (pathData.segments.includes("album")) {
			items.push({
				label: "專輯管理",
				isCurrentPage: pathData.segments.length === 3, // /admin/album
			});
		} else if (pathData.segments.includes("user")) {
			items.push({
				label: "用戶管理",
				isCurrentPage: true,
			});
		}
	}

	return (
		<Breadcrumb className={className}>
			<BreadcrumbList>
				{items.map((item, index) => (
					<>
						<BreadcrumbItem key={`${item.label}-${index}`}>
							{item.isCurrentPage ? (
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink asChild>
									<Link href={item.href || "#"}>{item.label}</Link>
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						{index < items.length - 1 && <BreadcrumbSeparator />}
					</>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

// 輔助函數：轉換日期範圍標籤
function getDateRangeLabel(segment: string): string {
	const rangeLabels: Record<string, string> = {
		"7days": "7 天",
		"30days": "30 天",
		"3months": "3 個月",
		"6months": "6 個月",
		"1year": "1 年",
		"all": "全部時間",
	};

	return rangeLabels[segment] || segment;
}