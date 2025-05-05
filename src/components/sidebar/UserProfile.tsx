import { ExtendedUser } from "@/types/auth";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import React from "react";

type UserProfileProps = {
	userSession: ExtendedUser;
};

export default function UserProfile({ userSession }: UserProfileProps) {
	return (
		<div className="flex items-center gap-4 rounded-xl border border-neutral-800 px-2.5 py-2 hover:bg-neutral-900">
			<div className="relative min-h-12 min-w-12">
				<Image
					className="rounded-xl"
					fill
					src={userSession.image || "/pic/placeholder.jpg"}
					alt="user profile"
					sizes="48px"
				/>
			</div>
			<div className="overflow-hidden">
				<p className="overflow-hidden text-ellipsis text-nowrap">
					{userSession.name}
				</p>
				<p className="text-caption overflow-hidden text-ellipsis text-nowrap">
					{userSession.role}
				</p>
			</div>
            <DotsHorizontalIcon className="ml-auto" />
		</div>
	);
}
