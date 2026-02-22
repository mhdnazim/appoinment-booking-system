import { Router } from 'express';
import { validateRegister, validateLogin } from '../../validations/auth/auth.validation';
import { register, login } from '../../controllers/auth/auth.controller';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

export default router;
