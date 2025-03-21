import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import config from '../config/config';

class AuthService {
    /**
     * Validates a user by email and password.
     * @param email - The user's email.
     * @param password - The user's password.
     * @returns The user object (without password) if valid, else null.
     */
    async validateUser(email: string, password: string) {
        const user = await User.findOne({ email }).lean();
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    /**
     * Logs in a user and returns a JWT token.
     * @param email - The user's email.
     * @param password - The user's password.
     * @returns An object with the access token and user data.
     */
    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const payload = { id: user._id, email: user.email, role: user.role };
        const token = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.accessExpirationMinutes || '7d',
        });

        return { access_token: token, user };
    }
}

export default AuthService;
