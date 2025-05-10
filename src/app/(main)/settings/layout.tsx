import ContentWrapper from "@/components/layout/ContentWrapper";
import { SettingsSidebarLayout } from "@/components/layout/SidebarLayout";
import { settingsSidebarMenuItems } from "@/config/sidebarMenu.config";
import Link from "next/link";

type SettingsLayoutProps = {
	children: React.ReactNode;
};

export default async function SettingsLayout({
	children,
}: SettingsLayoutProps) {
	return (
		<SettingsSidebarLayout>
			<ContentWrapper>
				<div className="space-y-6">
					{settingsSidebarMenuItems.map((menuItem) => (
						<Link
							className="block text-neutral-400 hover:text-neutral-100"
							key={menuItem.id}
							href={menuItem.href!}
						>
							{menuItem.label}
						</Link>
					))}
				</div>
			</ContentWrapper>
			<ContentWrapper className="max-w-[800px] space-y-14">
				{children}
			</ContentWrapper>
		</SettingsSidebarLayout>
	);
}
