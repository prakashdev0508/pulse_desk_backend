import { Router } from 'express';
import { me, organizationRegister, userLogin, userRegister } from '../controllers/auth.controller';
import { verifyToken } from '../../../middleware/auth/auth';
import {
  createPolicyPermission,
  getPolicies,
  getPolicyPermissions,
  policyCreate,
} from '../controllers/policy.controller';

const router = Router();

router.route('/orgination/register').post(organizationRegister);
router.route('/user/register').post(verifyToken, userRegister);
router.route('/user/login').post(userLogin);
router.route('/user/me').get(verifyToken, me);
router.route('/policypermission/create').post(verifyToken, createPolicyPermission);
router.route('/policypermission/get').get(verifyToken, getPolicyPermissions);
router.route('/policy/create').post(verifyToken, policyCreate);
router.route('/policy/get').get(verifyToken, getPolicies);

export default router;
