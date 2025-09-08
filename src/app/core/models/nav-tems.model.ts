export interface NavItem {
  url: string;
  iconUrl: string;
  name: string;
}

export interface NavItemResponse {
  items: NavItem[];
}