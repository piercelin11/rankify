import { getUserSession } from "../../../auth";
import { AppSidebarProvider } from "@/components/sidebar/AppSidebarProvider";
import { SimpleSidebar } from "@/components/sidebar/Sidebar";
import { ResponsiveLayout } from "@/components/sidebar/ResponsiveLayout";
import { getLoggedArtists } from "@/db/artist";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
	const user = await getUserSession();
	const loggedArtists = await getLoggedArtists(user.id);

	return (
		<>
			<AppSidebarProvider>
				<ResponsiveLayout
					sidebar={<SimpleSidebar user={user} artists={loggedArtists} />}
				>
					{children}
				</ResponsiveLayout>
			</AppSidebarProvider>
		</>
	);
}
