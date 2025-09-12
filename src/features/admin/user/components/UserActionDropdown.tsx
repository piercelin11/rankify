"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Trash2 } from "lucide-react";

type UserActionDropdownProps = {
	userId: string;
	userName: string;
}

export default function UserActionDropdown({
	userId,
	userName,
}: UserActionDropdownProps) {
	const handleViewDetails = () => {
		// TODO: 實作查看詳細資料功能
		console.log("View details for user:", userId);
	};

	const handleDelete = () => {
		// TODO: 實作刪除用戶功能
		console.log("Delete user:", userId, userName);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<MoreHorizontal className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={handleViewDetails}>
					<Eye className="mr-2 h-4 w-4" />
					View Details
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem 
					className="text-destructive"
					onClick={handleDelete}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}