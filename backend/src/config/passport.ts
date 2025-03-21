import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import config from './config';
import User from '../models/user.model';

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret,
};

passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
        try {
            const user = await User.findById(jwtPayload.id);
            if (user) return done(null, user);
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    }),
);

/**
 * Generates a JWT token for a user.
 * @param user - The user object.
 * @returns The signed JWT token.
 */
export const generateToken = (user: { id: string; email: string }) => {
    return jwt.sign({ id: user.id, email: user.email }, config.jwt.secret, {
        expiresIn: config.jwt.accessExpirationMinutes || '7d',
    });
};

/**
 * Verifies a JWT token.
 * @param token - The JWT token to verify.
 * @returns The decoded payload or an error.
 */
export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        return null;
    }
};

export default passport;
