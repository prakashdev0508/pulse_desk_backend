import { ModuleSlug, SubModuleSlug, PermissionSlug } from '@prisma/client';

export interface role_permissions {
  role_name: string;
  role_slug: string;
  description: string;
}

export interface verifyAccessTypes {
  slug: ModuleSlug;
  submodule: SubModuleSlug;
  permission: PermissionSlug;
}
