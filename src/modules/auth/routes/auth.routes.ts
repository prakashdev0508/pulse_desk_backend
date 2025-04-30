import { Router } from 'express';
import { me, organizationRegister, userLogin, userRegister } from '../controllers/auth.controller';
import { verifyroles, verifyToken } from '../../../middleware/auth';
import { userRegisterAccess } from '../../../utils/routeaccess/authroute.access';

const router = Router();

router.route('/orgination/register').post(organizationRegister);
router.route('/user/register').post(verifyToken, verifyroles(userRegisterAccess), userRegister);
router.route('/user/login').post(userLogin);
router.route('/user/me').get(verifyToken, me);

export default router;
