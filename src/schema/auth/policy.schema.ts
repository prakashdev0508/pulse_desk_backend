import { z } from "zod";
import { POLICY_PERMISSION_KEYS } from "../../utils/constants/index.contants";

export const createPolicyPermissionSchema = z.object({
    permissionName : z.string(),
    key : z.enum(POLICY_PERMISSION_KEYS as [string, ...string[]]),
    action : z.array(z.enum(['READ', 'UPDATE', 'DELETE', 'CREATE'])),
    effect : z.enum(['ALLOW', 'DENY']),
    policyType : z.enum(['INTERNAL', 'EXTERNAL']),
    description : z.string().optional(),
});

export const createPolicySchema = z.object({
    policyName : z.string(),
    description : z.string().optional(),
    permissions : z.array(z.string()).min(1),
    policyType : z.enum(['SYSTEM', 'CUSTOM']).optional(),
});
