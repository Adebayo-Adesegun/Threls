import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import config from '../config';
import User from '../../models/user.model';

const configureJwtStrategy = () => {
    const strategy = new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.jwt.secret,
        },
        async (jwtPayload, done) => {
            try {
                const user = await User.findById(jwtPayload.id).lean();
                if (!user) return done(null, false);
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        },
    );

    passport.use('jwt', strategy);
};

export default configureJwtStrategy;
