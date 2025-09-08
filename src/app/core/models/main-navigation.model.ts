export interface MainNavigationRoute {
  title: RouteName;
  path: `${'/' | ''}${RouterLinkName}`;
  outlet?: string;
}

export type RouteName = 'draftManagement' | 'live' | 'customizeColumns';

export type RouterLinkName = 'draft-management' | 'live' | 'customize-columns';
