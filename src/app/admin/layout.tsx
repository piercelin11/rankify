import SidebarLayout from "@/components/layout/SidebarLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { getUserSession } from "../../../auth";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
	const userSession = await getUserSession();
	return (
		<SidebarLayout>
			<AdminSidebar userSession={userSession} />

			<div>{children}</div>
		</SidebarLayout>
	);
}
