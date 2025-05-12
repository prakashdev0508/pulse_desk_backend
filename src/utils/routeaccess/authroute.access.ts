import { ModuleSlug, SubModuleSlug, PermissionSlug } from '@prisma/client';

export const checkAuthorizationAccess = {
  slug: ModuleSlug.saas,
  submodule: SubModuleSlug.admin,
  permission: PermissionSlug.can_create,
};
