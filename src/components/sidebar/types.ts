import { ExtendedUser } from "@/types/auth";
import { ArtistData } from "@/types/data";
import { LucideProps } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
  href?: string;
  action?: () => void;
  children?: MenuItem[];
}

export interface SidebarProps {
  user: ExtendedUser;
  artists: ArtistData[];
}