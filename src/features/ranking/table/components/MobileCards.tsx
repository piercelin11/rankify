import { Table } from "@tanstack/react-table";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import TrackCell from "./TrackCell";
import type { RankingListDataTypeExtend, RankingTableAppearance } from "../types";

type MobileCardsProps<T> = {
	table: Table<T>;
	appearance: RankingTableAppearance;
};

export default function MobileCards<T extends RankingListDataTypeExtend>({
	table,
	appearance,
}: MobileCardsProps<T>) {
	return (
		<div className="space-y-3 md:hidden">
			{table.getRowModel().rows?.length ? (
				table.getRowModel().rows.map((row) => {
					const item = row.original;
					return (
						<Link
							key={row.id}
							href={`/artist/${item.artistId}/track/${item.id}`}
						>
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
						</Link>
					);
				})
			) : (
				<div className="py-8 text-center text-muted-foreground">
					No data found
				</div>
			)}
		</div>
	);
}