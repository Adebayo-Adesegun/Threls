import { Request, Response } from 'express';
import { POST, route } from 'awilix-express';
import passport from 'passport';
import AuthService from '../services/auth.service';
import Validate from '../middlewares/validateRequest';
import {
    loginSchema,
    registerSchema,
} from '../schemas/validations/auth/auth.validation';
import SanitizerService from '../services/sanitizer.service';

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication APIs
 */
@route('/auth')
class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly sanitizerService: SanitizerService,
    ) {}

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: User login
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Login'
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *              $ref: '#/components/schemas/LoginResponse'
     *       400:
     *         description: Login failed
     */

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
                        .json(
                            this.sanitizerService.formatResponse(
                                false,
                                info?.message || 'Login failed',
                            ),
                        );
                }

                const token = await this.authService.login(
                    user.email,
                    req.body.password,
                );
                return res.json(
                    this.sanitizerService.formatResponse(
                        true,
                        'login successful',
                        token,
                    ),
                );
            },
        )(req, res);
    }

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Register'
     *     responses:
     *       201:
     *         description: User created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/RegisterResponse'
     */
    @POST()
    @route('/register')
    @Validate(registerSchema)
    async register(req: Request, res: Response): Promise<Response> {
        const result = await this.authService.register(req.body);
        return res
            .status(201)
            .json(
                this.sanitizerService.formatResponse(
                    true,
                    'user created successfully',
                    result,
                ),
            );
    }
}

export default AuthController;
