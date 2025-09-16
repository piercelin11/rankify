import { Table } from "@tanstack/react-table";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import TrackCell from "./TrackCell";
import type { RankingListDataTypeExtend, RankingTableAppearance } from "../types";

type MobileCardsProps<T> = {
	table: Table<T>;
	appearance: RankingTableAppearance;
	onRowClick?: (item: T) => void;
	getRowHref?: (item: T) => string;
};

export default function MobileCards<T extends RankingListDataTypeExtend>({
	table,
	appearance,
	onRowClick,
	getRowHref,
}: MobileCardsProps<T>) {
	return (
		<div className="space-y-3 md:hidden">
			{table.getRowModel().rows?.length ? (
				table.getRowModel().rows.map((row) => {
					const item = row.original;
					const CardComponent = (
						<Card className="transition-colors hover:bg-accent/50">
							<CardContent className="p-4">
								<div className="flex items-center gap-3">
									<div className="w-8 text-xl font-bold text-muted-foreground">
										{item.ranking}
									</div>
									<TrackCell
										item={item}
										appearance={appearance}
										imageSize="md"
									/>
								</div>
							</CardContent>
						</Card>
					);

					if (getRowHref) {
						return (
							<Link key={row.id} href={getRowHref(item)}>
								{CardComponent}
							</Link>
						);
					}

					if (onRowClick) {
						return (
							<div
								key={row.id}
								className="cursor-pointer"
								onClick={() => onRowClick(item)}
							>
								{CardComponent}
							</div>
						);
					}

					return <div key={row.id}>{CardComponent}</div>;
				})
			) : (
				<div className="py-8 text-center text-muted-foreground">
					No data found
				</div>
			)}
		</div>
	);
}