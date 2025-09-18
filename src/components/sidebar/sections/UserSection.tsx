import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
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
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ExtendedUser } from "@/types/auth";
import { MenuItem } from "../types";
import { PLACEHOLDER_PIC } from "@/constants";

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
			<div className="grid overflow-hidden text-left leading-tight">
				<span className="truncate font-semibold">{user.name}</span>
				{/* <span className="truncate text-sm text-muted-foreground">
          {user.role}
        </span> */}
			</div>
		</div>
	);

	return (
		<>
			<Collapsible className="group/collapsible group-data-[collapsible=icon]:hidden">
				<CollapsibleContent>
					<SidebarMenuSub>
						{footerItems.map((item) => (
							<SidebarMenuSubItem key={item.id}>
								{item.href ? (
									<SidebarMenuSubButton asChild>
										<Link href={item.href}>
											{item.icon}
											<span>{item.label}</span>
										</Link>
									</SidebarMenuSubButton>
								) : (
									<SidebarMenuSubButton onClick={item.action}>
										{item.icon}
										<span>{item.label}</span>
									</SidebarMenuSubButton>
								)}
							</SidebarMenuSubItem>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12 p-1.5">
						{userInfo}
						<ChevronDownIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
					</SidebarMenuButton>
				</CollapsibleTrigger>
			</Collapsible>

			<div className="hidden group-data-[collapsible=icon]:block">
				<div className="px-1.5 py-2">
					<DropdownMenu>
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
						<DropdownMenuContent side="right" align="end">
							<div className="flex items-center gap-2 border-b p-2">
								{userInfo}
							</div>
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
