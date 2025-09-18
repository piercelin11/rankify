import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { MenuItem } from "../types";
import { MenuItemComponent } from "../MenuItem";
import Link from "next/link";

interface MenuSectionProps {
  items: MenuItem[];
}

export function MenuSection({ items }: MenuSectionProps) {
  return (
    <SidebarMenu className="px-2">
      {items.map((item) => (
        <SidebarMenuItem key={item.id}>
          {item.children ? (
            <CollapsibleMenuItem item={item} />
          ) : (
            <MenuItemComponent item={item} />
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function CollapsibleMenuItem({ item }: { item: MenuItem }) {
  return (
    <>
      <Collapsible defaultOpen className="group/collapsible group-data-[collapsible=icon]:hidden">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            {item.icon}
            <span>{item.label}</span>
            <ChevronDownIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => (
              <SidebarMenuSubItem key={child.id}>
                <SidebarMenuSubButton asChild>
                  <Link href={child.href || "#"}>
                    {child.icon}
                    <span>{child.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>

      <div className="group-data-[collapsible=icon]:block hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              {item.icon}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            {item.children?.map((child) => (
              <DropdownMenuItem key={child.id} asChild>
                <Link href={child.href || "#"} className="flex items-center gap-2">
                  {child.icon}
                  <span>{child.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}