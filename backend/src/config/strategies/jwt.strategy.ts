import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from '../config';
import User from '../../models/user.model';

const jwtStrategy = () => {
    return new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.jwt.secret,
        },
        async (payload, done) => {
            try {
                const user = await User.findById(payload.id).lean();
                if (!user) return done(null, false);
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        },
    );
};

export default jwtStrategy;
