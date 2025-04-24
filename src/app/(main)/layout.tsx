import SidebarLayout from "@/components/layout/SidebarLayout";
import { getUserSession } from "../../../auth";
import getLoggedArtists from "@/lib/database/user/getLoggedArtists";
import MainSidebar from "@/components/sidebar/MainSidebar";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
	const userSession = await getUserSession();
	const loggedArtists = await getLoggedArtists({ userId: userSession.id });

	return (
		<SidebarLayout>
			<MainSidebar userSession={userSession} artistData={loggedArtists} />
			<div>{children}</div>
		</SidebarLayout>
	);
}
