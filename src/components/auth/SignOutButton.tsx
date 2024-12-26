"use client";

import React from "react";
import Button from "../ui/Button";
import { ExitIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
	return (
		<Button
			variant="menu"
			onClick={() => signOut()}
		>
			<ExitIcon />
			Sign out
		</Button>
	);
}
