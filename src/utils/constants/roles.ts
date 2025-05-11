
export const DEFAULT_ROLES = [
  {
    role_slug: 'account_owner',
    role_name: 'Account Owner',
    description: 'Has full access to all features (except saas)',
    not_permissions_module: ['saas'],
    not_permissions_sub_module: [],
  },
  {
    role_slug: 'support_manager',
    role_name: 'Support Manager',
    description: 'Can access everything except admin sub-modules (excluding saas)',
    not_permissions_module: ['saas'],
    not_permissions_sub_module: ['admin'],
  },
];

