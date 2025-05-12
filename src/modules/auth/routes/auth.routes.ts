import { Router } from 'express';
import {
  checkAuthorization,
  me,
  organizationRegister,
  userLogin,
  userRegister,
} from '../controllers/auth.controller';
import { verifyroles, verifyToken } from '../../../middleware/auth';
import { checkAuthorizationAccess } from '../../../utils/routeaccess/authroute.access';
import {
  createBulkRolePermissions,
  createDefaultRoles,
  createRolePermissions,
  getAllRolePermissions,
  getAllRoles,
  assignRoleToUser
} from '../controllers/roles.controller';
import { verifyAccess } from '../../../middleware/authorization';

const router = Router();

router.route('/orgination/register').post(organizationRegister);
router.route('/user/register').post(verifyToken, userRegister);
router.route('/user/login').post(userLogin);
router.route('/user/me').get(verifyToken, me);

//Need to add authorization for this routes
// router.route('/role/permissions/create').post(verifyToken, createRolePermissions);
// router.route('/role/permissions/bulk').post(verifyToken, createBulkRolePermissions);
// router.route('/role/default').post(verifyToken, createDefaultRoles);

router.route('/role/permissions').get(verifyToken, getAllRolePermissions);
router.route('/role/all').get(verifyToken, getAllRoles);
router.route('/role/assign').post(verifyToken, assignRoleToUser);
router.route('/check/authorization').get(
  verifyToken,
  verifyAccess(checkAuthorizationAccess),
  checkAuthorization
);


export default router;
