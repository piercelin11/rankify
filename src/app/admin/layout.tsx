import SidebarLayout from "@/components/sidebar/SidebarLayout";

type AdminLayoutProps = {
    children: React.ReactNode;
}

export default function AdminLayout({children}: AdminLayoutProps) {
  return (
    <SidebarLayout>
			<p>sidebar</p>

			<div>
				{children}
			</div>
		</SidebarLayout>
  )
}
