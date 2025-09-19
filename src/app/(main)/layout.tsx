import { getUserSession } from "../../../auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SimpleSidebar } from "@/components/sidebar/SimpleSidebar";
import { ResponsiveLayout } from "@/components/sidebar/ResponsiveLayout";
import { getLoggedArtists } from "@/db/artist";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
	const user = await getUserSession();
	const loggedArtists = await getLoggedArtists(user.id);

	return (
		<SidebarProvider defaultOpen={true}>
			<ResponsiveLayout
				sidebar={<SimpleSidebar user={user} artists={loggedArtists} />}
			>
				{children}
			</ResponsiveLayout>
		</SidebarProvider>
	);
}
