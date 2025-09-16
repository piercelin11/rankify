import { Table } from "@tanstack/react-table";
import {
	Table as UITable,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import TrackCell from "./TrackCell";
import type { RankingListDataTypeExtend, RankingTableFeatures, RankingTableAppearance } from "../types";

type TabletTableProps<T> = {
	table: Table<T>;
	features: RankingTableFeatures;
	appearance: RankingTableAppearance;
};

export default function TabletTable<T extends RankingListDataTypeExtend>({
	table,
	features,
	appearance,
}: TabletTableProps<T>) {
	return (
		<div className="hidden md:block lg:hidden">
			<div className="rounded-md">
				<UITable>
					{features.header !== false && (
						<TableHeader>
							<TableRow>
								<TableHead className="bg-transparent px-4 text-right">
									#
								</TableHead>
								<TableHead className="bg-transparent px-4">Track</TableHead>
							</TableRow>
						</TableHeader>
					)}
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									<TableCell className="font-mono px-4 text-right">
										{row.original.ranking}
									</TableCell>
									<TableCell className="px-4">
										<TrackCell
											item={row.original}
											appearance={appearance}
											imageSize="sm"
										/>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={3} className="h-24 text-center">
									No data found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</UITable>
			</div>
		</div>
	);
}