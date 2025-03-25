import { Request, Response } from 'express';
import { POST, route } from 'awilix-express';
import passport from 'passport';
import AuthService from '../services/auth.service';
import Validate from '../middlewares/validateRequest';
import {
    loginSchema,
    registerSchema,
} from '../validations/auth/auth.validation';

@route('/auth')
class AuthController {
    constructor(private readonly authService: AuthService) {}

    @POST()
    @Validate(loginSchema)
    @route('/login')
    async login(req: Request, res: Response) {
        passport.authenticate(
            'local',
            { session: false },
            async (
                err: Error | null,
                user: { email: string },
                info: { message?: string },
            ) => {
                if (err || !user) {
                    return res
                        .status(400)
                        .json({ message: info?.message || 'Login failed' });
                }

                const token = await this.authService.login(
                    user.email,
                    req.body.password,
                );
                return res.json(token);
            },
        )(req, res);
    }

    @POST()
    @route('/register')
    @Validate(registerSchema)
    async register(req: Request, res: Response): Promise<Response> {
        const result = await this.authService.register(req.body);
        return res.status(201).json(result);
    }
}

export default AuthController;
