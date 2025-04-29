import {Router} from 'express';
import { organizationRegister } from '../controllers/auth.controller';

const router = Router();

router.route('/orgination/register').post(organizationRegister)

export default router;