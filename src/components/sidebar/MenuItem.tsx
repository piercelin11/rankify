import Link from "next/link";
import { MenuItem } from "./types";
import { SidebarMenuButton } from "@/components/ui/sidebar";

interface MenuItemProps {
  item: MenuItem;
  className?: string;
}

export function MenuItemComponent({ item, className }: MenuItemProps) {
  const content = (
    <>
      {item.icon}
      <span>{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <SidebarMenuButton asChild className={className}>
        <Link href={item.href}>{content}</Link>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton onClick={item.action} className={className}>
      {content}
    </SidebarMenuButton>
  );
}