"use client";

import { useState } from "react";
import { useRankingTable } from "./hooks/useRankingTable";
import WindowVirtualizedTable from "./components/WindowVirtualizedTable";
import FilterToolbar from "./components/FilterToolbar";
import type {
	RankingTableProps,
	AdvancedFilters,
	RankingListDataTypeExtend,
} from "./types";
import SimpleSegmentControl from "@/components/navigation/SimpleSegmentControl";
import SimpleDropdown from "@/components/dropdown/SimpleDropdown";
import { dateToDashFormat } from "@/lib/utils";

export default function RankingTable<T extends RankingListDataTypeExtend>({
	data,
	columnKey,
	currentSubmissionId,
	submissions = [],
	isLoading = false,
	className,
	availableAlbums = [],
	view,
}: RankingTableProps<T>) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});

	const { tableColumns } = useRankingTable({
		data,
		columnKey,
	});

	const handleFiltersChange = (filters: AdvancedFilters) => {
		setAdvancedFilters(filters);
	};

	const currentSubmission = submissions.find(
		(s) => s.id === currentSubmissionId
	);
	const latestSubmissionId = submissions[0].id;

	return (
		<div className={className}>
			<div className="mb-8 flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<SimpleSegmentControl
						className="border-transparent bg-secondary"
						size="sm"
						options={[
							{
								value: "average",
								label: "Average",
								href: `/artist/${data[0].artistId}/my-stats?view=all-rankings`,
							},
							{
								value: "snapshot",
								label: "Snapshot",
								href: `/artist/${data[0].artistId}/my-stats?submissionId=${latestSubmissionId}&view=all-rankings`,
							},
						]}
						value={view}
					/>
					{currentSubmission && (
						<div className="flex items-center gap-2">
							<p className="text-sm text-muted-foreground">View rankings from:</p>
							<SimpleDropdown
								size="sm"
								className="w-fit min-w-36 border-transparent bg-secondary"
								value={currentSubmission.id}
								placeholder={dateToDashFormat(currentSubmission.date)}
								options={submissions.map((s) => ({
									value: s.id,
									label: dateToDashFormat(s.date),
									href: `/artist/${data[0].artistId}/my-stats?submissionId=${s.id}&view=all-rankings`,
								}))}
							/>
						</div>
					)}
				</div>
				<FilterToolbar
					globalFilter={globalFilter}
					onGlobalFilterChange={setGlobalFilter}
					filters={advancedFilters}
					onFiltersChange={handleFiltersChange}
					availableAlbums={availableAlbums}
				/>
			</div>

			<WindowVirtualizedTable
				data={data}
				columns={tableColumns}
				globalFilter={globalFilter}
				onGlobalFilterChange={setGlobalFilter}
				advancedFilters={advancedFilters}
				isLoading={isLoading}
			/>

			{!isLoading && data.length === 0 && (
				<div className="py-8 text-center text-muted-foreground">
					No tracks found
				</div>
			)}
		</div>
	);
}
