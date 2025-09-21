import { getUserSession } from "../../../auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SimpleSidebar } from "@/components/sidebar/SimpleSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { getLoggedArtists } from "@/db/artist";
import ScrollIsolationWrapper from "@/components/layout/ScrollIsolationWrapper";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
	const user = await getUserSession();
	const loggedArtists = await getLoggedArtists(user.id);

	return (
		<SidebarProvider defaultOpen={true}>
			<ScrollIsolationWrapper>
				<SimpleSidebar user={user} artists={loggedArtists} />
			</ScrollIsolationWrapper>
			<SidebarInset className="w-ful h-full">
				<AppHeader />
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
