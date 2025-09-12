"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getSortedRowModel,
	SortingState,
	getFilteredRowModel,
	ColumnFiltersState,
	getPaginationRowModel,
	PaginationState,
} from "@tanstack/react-table";
import { useState, useEffect, useTransition } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import updateUser from "../actions/updateUser";
import { InlineSelectCell } from "../../editContent/components/InlineEditor";
import UserActionDropdown from "./UserActionDropdown";
import { Button } from "@/components/ui/button";

type UserData = {
	id: string;
	name: string;
	email: string | null;
	role: Role;
	createdAt: Date;
};

type UserTableProps = {
	users: UserData[];
	className?: string;
}

export default function UserTable({
	users,
	className,
}: UserTableProps) {
	const [data, setData] = useState(users);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [, startTransition] = useTransition();

	// Update data when users prop changes
	useEffect(() => {
		setData(users);
	}, [users]);

	const handleUpdateUser = async (userId: string, role: Role) => {
		const user = data.find((u) => u.id === userId);
		if (!user) return;

		// Optimistic update - update UI immediately
		setData((prev) =>
			prev.map((u) => (u.id === userId ? { ...u, role } : u))
		);

		startTransition(async () => {
			try {
				const result = await updateUser({ userId, role });

				if (result.type !== "success") {
					console.error("Failed to update user:", result.message);
					// Revert on failure
					setData((prev) =>
						prev.map((u) => (u.id === userId ? { ...u, role: user.role } : u))
					);
				}
			} catch (error) {
				console.error("Error updating user:", error);
				// Revert on error
				setData((prev) =>
					prev.map((u) => (u.id === userId ? { ...u, role: user.role } : u))
				);
			}
		});
	};

	const columns: ColumnDef<UserData>[] = [
		{
			accessorKey: "id",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="p-0"
					>
						ID
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => (
				<div className="font-mono text-xs text-muted-foreground">
					{row.original.id.slice(0, 8)}...
				</div>
			),
			size: 120,
			minSize: 120,
			maxSize: 120,
		},
		{
			accessorKey: "name",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="p-0"
					>
						Name
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => (
				<div className="font-medium">
					{row.original.name}
				</div>
			),
			size: 200,
			minSize: 150,
			maxSize: 250,
		},
		{
			accessorKey: "email",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="p-0"
					>
						Email
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => (
				<div className="text-muted-foreground">
					{row.original.email || "No Email"}
				</div>
			),
			size: 250,
			minSize: 200,
			maxSize: 300,
		},
		{
			accessorKey: "role",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="p-0"
					>
						Role
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => (
				<InlineSelectCell
					value={row.original.role}
					onSave={(value) => {
						handleUpdateUser(row.original.id, value as Role);
					}}
					options={Object.values(Role).map((role) => ({
						value: role,
						label: role === Role.ADMIN ? "Admin" : "User",
					}))}
				/>
			),
			size: 120,
			minSize: 100,
			maxSize: 150,
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="p-0"
					>
						Created At
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => (
				<div className="text-muted-foreground">
					{new Date(row.original.createdAt).toLocaleDateString("en-US", {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
					})}
				</div>
			),
			size: 120,
			minSize: 100,
			maxSize: 150,
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<UserActionDropdown
					userId={row.original.id}
					userName={row.original.name}
				/>
			),
			size: 20,
			minSize: 20,
			maxSize: 20,
		},
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		getRowId: (row) => row.id,
		columnResizeMode: 'onChange',
		defaultColumn: {
			size: 150,
			minSize: 50,
			maxSize: 500,
		},
		state: {
			sorting,
			columnFilters,
			pagination,
		},
	});

	return (
		<div className={cn("w-full space-y-4", className)}>
			<div className="flex items-center space-x-2">
				<Input
					placeholder="Filter by name..."
					value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("name")?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
				<Input
					placeholder="Filter by email..."
					value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("email")?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
				<Select
					value={(table.getColumn("role")?.getFilterValue() as string) ?? "all"}
					onValueChange={(value) =>
						table.getColumn("role")?.setFilterValue(value === "all" ? "" : value)
					}
				>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="Filter by role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Roles</SelectItem>
						<SelectItem value={Role.ADMIN}>Admin</SelectItem>
						<SelectItem value={Role.USER}>User</SelectItem>
					</SelectContent>
				</Select>
			</div>
			
			<div className="rounded-md border border-muted">
				<Table className="table-fixed">
					<colgroup>
						<col style={{ width: '120px' }} />
						<col style={{ width: '200px' }} />
						<col style={{ width: '250px' }} />
						<col style={{ width: '120px' }} />
						<col style={{ width: '120px' }} />
						<col style={{ width: '80px' }} />
					</colgroup>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="border-muted">
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} className="border-muted">
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} className="border-muted">
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="border-muted">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 border-muted text-center"
								>
									No results found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			
			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="text-sm text-muted-foreground">
					Showing {table.getRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} users
					{table.getFilteredRowModel().rows.length !== data.length && (
						<span> (filtered from {data.length} total)</span>
					)}
				</div>
				
				<div className="flex items-center space-x-2">
					<div className="text-sm text-muted-foreground">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<div className="flex items-center space-x-1">
						<Button
							variant="outline"
							size="icon"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
							className="h-8 w-8 p-0"
						>
							<ChevronsLeft className="h-4 w-4" />
							<span className="sr-only">Go to first page</span>
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className="h-8 w-8 p-0"
						>
							<ChevronLeft className="h-4 w-4" />
							<span className="sr-only">Go to previous page</span>
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className="h-8 w-8 p-0"
						>
							<ChevronRight className="h-4 w-4" />
							<span className="sr-only">Go to next page</span>
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
							className="h-8 w-8 p-0"
						>
							<ChevronsRight className="h-4 w-4" />
							<span className="sr-only">Go to last page</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}