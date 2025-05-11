import { z } from 'zod';
import { ModuleSlug, PermissionSlug, SubModuleSlug } from '@prisma/client';

export const createRolePermissionsSchema = z.object({
  permission_name: z.string().min(1),
  description: z.string().optional(),
  module_slug: z.enum(Object.values(ModuleSlug) as [string, ...string[]]),
  permission_slug: z.enum(Object.values(PermissionSlug) as [string, ...string[]]),
  sub_module_slug: z.enum(Object.values(SubModuleSlug) as [string, ...string[]]),
});
