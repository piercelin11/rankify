import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

type BreadcrumbItemData = {
	label: string;
	href?: string;
	isCurrentPage?: boolean;
};

type SimpleBreadcrumbProps = {
	items: BreadcrumbItemData[];
	className?: string;
};

export default function SimpleBreadcrumb({
	items,
	className,
}: SimpleBreadcrumbProps) {
	return (
		<Breadcrumb className={className}>
			<BreadcrumbList>
				{items.map((item, index) => (
					<Fragment key={`${item.label}-${index}`}>
						<BreadcrumbItem className="text-secondary-foreground">
							{item.isCurrentPage ? (
								<BreadcrumbPage className="text-base">{item.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink className="text-base" asChild>
									<Link href={item.href || "#"}>{item.label}</Link>
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						{index < items.length - 1 && <BreadcrumbSeparator className="text-secondary-foreground" />}
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

// 輔助函數：快速創建 breadcrumb 項目
export function createBreadcrumbItems(
	items: Array<{
		label: string;
		href?: string;
		isCurrentPage?: boolean;
	}>
): BreadcrumbItemData[] {
	return items.map((item, index, array) => ({
		...item,
		isCurrentPage: item.isCurrentPage || index === array.length - 1,
	}));
}