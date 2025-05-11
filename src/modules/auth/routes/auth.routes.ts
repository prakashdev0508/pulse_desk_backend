import { Router } from 'express';
import { me, organizationRegister, userLogin, userRegister } from '../controllers/auth.controller';
import { verifyroles, verifyToken } from '../../../middleware/auth';
import { userRegisterAccess } from '../../../utils/routeaccess/authroute.access';
import { createBulkRolePermissions, createDefaultRoles, createRolePermissions, getAllRolePermissions } from '../controllers/roles.controller';

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

export default router;
