import { Request, Response } from 'express';
import AuthService from '../services/auth.service';

class AuthController {
    private authService: AuthService;

    constructor({ authService }: { authService: AuthService }) {
        this.authService = authService;
    }

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            res.json(result);
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ message: error.message });
            } else {
                res.status(401).json({ message: 'An unknown error occurred' });
            }
        }
    };
}

export default AuthController;
