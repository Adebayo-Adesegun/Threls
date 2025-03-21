import { Router } from 'express';
import container from '../di-container';
import AuthController from '../controllers/auth.controller';

const router = Router();
const authController = container.resolve<AuthController>('authController');

router.post('/login', authController.login);

export default router;
