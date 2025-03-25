import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../../models/user.model';

async function verifyCallback(
    email: string,
    password: string,
    done: (error: any, user?: any, options?: any) => void,
) {
    try {
        const user = await User.findOne({ email }).lean();
        if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}

function createLocalStrategy() {
    return new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        verifyCallback,
    );
}

export default createLocalStrategy;
