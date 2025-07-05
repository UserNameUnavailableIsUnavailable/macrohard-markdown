export type SidebarItem = {
  title: string;
  href: string;
  expanded?: boolean;
  activated?: boolean;
  children?: SidebarItem[];
}

export type Sidebar = {
  children: SidebarItem[] | undefined;
}
