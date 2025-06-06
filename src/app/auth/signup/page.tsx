import React from "react";
import Link from "next/link";
import SocialButton from "@/features/auth/components/SocialButton";

export default function SignupPage() {
	return (
		<div className="rounded-xl border border-neutral-700 p-24">
			<div className="space-y-10">
				<div>
					<h2 className="text-center">Join rankify.fm</h2>
					<p className="text-description text-center">
						Sign up and ranked your favorite artist.
					</p>
				</div>

				<SocialButton />

				<p className="text-center text-neutral-400">
					Already have an account?{" "}
					<span className="text-neutral-100 underline">
						<Link href={"/auth/login"}>Sign in</Link>
					</span>
				</p>
			</div>
		</div>
	);
}
