
import { Description } from "@/components/ui/Text";
import React from "react";
import Link from "next/link";
import SocialButton from "@/components/auth/SocialButton";

export default function SignupPage() {
	return (
		<div className="rounded-xl border border-zinc-700 p-24">
			<div className="space-y-10">
				<div>
					<h2 className="text-center">Join rankify.fm</h2>
					<Description className="text-center">
						Sign up and ranked your favorite artist.
					</Description>
				</div>

				<SocialButton />

				<p className="text-center text-zinc-400">
					Already have an account?{" "}
					<span className="text-zinc-100 underline">
						<Link href={"/auth/login"}>Sign in</Link>
					</span>
				</p>
			</div>
		</div>
	);
}
