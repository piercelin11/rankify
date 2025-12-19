import { requireAdmin } from "@/../auth";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
	await requireAdmin();

	return <>{children}</>;
}
