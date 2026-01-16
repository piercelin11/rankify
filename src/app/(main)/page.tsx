import { getCurrentSession } from "@/../auth";
import GuestHomePage from "@/features/home/components/GuestHomePage";
import UserHomePage from "@/features/home/components/UserHomePage";

export default async function HomePage() {

	const user = await getCurrentSession();
	
	if (!user) return <GuestHomePage />

	const userId = user.id;

	return <UserHomePage userId={userId} />;
}
