import ProfileSettingsForm from "@/features/settings/components/ProfileSettingsForm";

import { requireSession } from "../../../../auth";
import getUserById from "@/lib/database/user/getUserById";
import { notFound } from "next/navigation";

export default async function SettingsPage() {
	const { id: userId } = await requireSession();
	const user = await getUserById({ userId });

	if (!user) notFound();

	return (
		<>
			<div className="space-y-2">
				<h2>Profile Settings</h2>
				<p className="text-description">
					Configure your profile and account details. Customize personal
					information, manage preferences, and control account settings to fit
					your needs.
				</p>
			</div>
			<ProfileSettingsForm user={user} />
		</>
	);
}
