import ContentWrapper from "@/components/layout/ContentWrapper";
import {
	SettingsSidebarLayout,
} from "@/components/layout/SidebarLayout";
import { settingsMenuData } from "@/config/menuData";
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
					{settingsMenuData.map((menuItem) => (
						<Link
							className="block text-neutral-400 hover:text-neutral-100"
							key={menuItem.name}
							href={menuItem.link}
						>
							{menuItem.name}
						</Link>
					))}
				</div>
			</ContentWrapper>
			<ContentWrapper className="w-[800px]">{children}</ContentWrapper>
		</SettingsSidebarLayout>
	);
}
