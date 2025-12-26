"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { ExtendedUser } from "@/types/auth.d";
import { PLACEHOLDER_PIC } from "@/constants/placeholder.constants";

export function AuthSection({ user }: { user: ExtendedUser | null }) {
	if (!user) {
		return (
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/auth/signin">Log in</Link>
				</Button>
				<Button size="sm" asChild>
					<Link href="/auth/signin">Sign up</Link>
				</Button>
			</div>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
					<div className="relative h-9 w-9 overflow-hidden rounded-full">
						<Image
							src={user.image || PLACEHOLDER_PIC}
							alt={user.name || "User"}
							fill
							className="object-cover"
						/>
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/settings">Settings</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings/ranking">Ranking Settings</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
