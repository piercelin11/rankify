import Image from "next/image";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ExtendedUser } from "@/types/auth";
import { MenuItem } from "../types";
import { PLACEHOLDER_PIC } from "@/constants";
import { MoreHorizontal } from "lucide-react";

interface UserSectionProps {
	user: ExtendedUser;
	footerItems: MenuItem[];
}

export function UserSection({ user, footerItems }: UserSectionProps) {
	return (
		<SidebarFooter>
			<SidebarMenu>
				<SidebarMenuItem>
					<UserMenu user={user} footerItems={footerItems} />
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter>
	);
}

function UserMenu({ user, footerItems }: UserSectionProps) {
	const userInfo = (
		<div className="flex items-center gap-2">
			<div className="relative size-8 flex-shrink-0">
				<Image
					src={user.image || PLACEHOLDER_PIC}
					alt={user.name || "User"}
					fill
					className="rounded-full object-cover"
					sizes="32px"
				/>
			</div>
			<div className="grid gap-0 overflow-hidden text-left leading-tight">
				<span className="truncate font-semibold">{user.name}</span>
				<span className="truncate text-xs text-muted-foreground">
					{user.role}
				</span>
			</div>
		</div>
	);

	return (
		<>
			{/* 展開狀態：使用 DropdownMenu 向上懸浮 */}
			<div className="relative group-data-[collapsible=icon]:hidden">
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton className="h-12 p-1.5">
							{userInfo}
							<MoreHorizontal className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="top" align="start" className="w-60" avoidCollisions={true}>
						{footerItems.map((item) => (
							<DropdownMenuItem key={item.id} asChild={!!item.href}>
								{item.href ? (
									<Link href={item.href} className="flex items-center gap-2">
										{item.icon}
										<span>{item.label}</span>
									</Link>
								) : (
									<button
										onClick={item.action}
										className="flex w-full items-center gap-2"
									>
										{item.icon}
										<span>{item.label}</span>
									</button>
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* 收起狀態：使用 DropdownMenu 向右懸浮 */}
			<div className="hidden group-data-[collapsible=icon]:block">
				<div className="px-1.5 py-2">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton size="lg" className="justify-center">
								<div className="relative size-8 flex-shrink-0">
									<Image
										src={user.image || PLACEHOLDER_PIC}
										alt={user.name || "User"}
										fill
										className="rounded-full object-cover"
										sizes="32px"
									/>
								</div>
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent side="right" align="end" avoidCollisions={true}>
							{footerItems.map((item) => (
								<DropdownMenuItem key={item.id} asChild={!!item.href}>
									{item.href ? (
										<Link href={item.href} className="flex items-center gap-2">
											{item.icon}
											<span>{item.label}</span>
										</Link>
									) : (
										<button
											onClick={item.action}
											className="flex w-full items-center gap-2"
										>
											{item.icon}
											<span>{item.label}</span>
										</button>
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</>
	);
}
