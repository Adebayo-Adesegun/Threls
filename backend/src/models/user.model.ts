import mongoose from 'mongoose';
import { roles } from '../config/roles';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
            validate(value: string) {
                if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                    throw new Error(
                        'Password must contain at least one letter and one number',
                    );
                }
            },
        },
        role: {
            type: String,
            enum: roles,
            default: 'customer',
        },
    },
    {
        timestamps: true,
    },
);

const User = mongoose.model('User', userSchema);
export default User;
