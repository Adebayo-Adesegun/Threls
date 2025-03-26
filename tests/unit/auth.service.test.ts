import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import User from '../../src/models/user.model';
import AuthService from '../../src/services/auth.service';
import config from '../../src/config/config';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../src/models/user.model');

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('validateUser', () => {
        it('should return user without password if credentials are correct', async () => {
            const idString = new Types.ObjectId();
            const mockUser = {
                _id: idString,
                email: 'test@example.com',
                password: 'hashedpass',
                role: 'user',
            };

            (User.findOne as jest.Mock).mockImplementation(() => ({
                lean: jest.fn().mockResolvedValue(mockUser), // Mocking lean properly
            }));
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await authService.validateUser(
                'test@example.com',
                'password',
            );

            expect(result).toEqual({
                _id: idString,
                email: 'test@example.com',
                role: 'user',
            });
            expect(User.findOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'password',
                'hashedpass',
            );
        });

        it('should return null if credentials are incorrect', async () => {
            (User.findOne as jest.Mock).mockImplementation(() => ({
                lean: jest.fn().mockResolvedValue(null), // Mocking lean properly
            }));

            const result = await authService.validateUser(
                'test@example.com',
                'wrongpassword',
            );

            expect(result).toBeNull();
            expect(User.findOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
        });
    });

    describe('login', () => {
        it('should return access token if credentials are valid', async () => {
            const idString = new Types.ObjectId();
            const mockUser = {
                _id: idString,
                name: 'daniel',
                email: 'test@example.com',
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
                __v: 0,
            };
            jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
            (jwt.sign as jest.Mock).mockReturnValue('mockedToken');

            const result = await authService.login(
                'test@example.com',
                'password',
            );

            expect(result).toEqual({
                access_token: 'mockedToken',
                user: mockUser,
            });
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: idString, email: 'test@example.com', role: 'user' },
                config.jwt.secret,
                { expiresIn: config.jwt.accessExpirationSeconds || '7d' },
            );
        });

        it('should throw an error if credentials are invalid', async () => {
            jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

            await expect(
                authService.login('test@example.com', 'wrongpassword'),
            ).rejects.toThrow('Invalid credentials');
        });
    });

    describe('register', () => {
        it('should create a new user and return user without password', async () => {
            const mockUserData = {
                email: 'test@example.com',
                password: 'plaintext',
                role: 'user',
            };
            const mockUser = {
                _id: '123',
                ...mockUserData,
                password: 'hashedpass',
            };

            (User.findOne as jest.Mock).mockImplementation(() => ({
                lean: jest.fn().mockResolvedValue(null), // Mocking lean properly
            }));
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
            (User.create as jest.Mock).mockResolvedValue({
                toObject: () => mockUser,
            });

            const result = await authService.register(mockUserData);

            expect(result).toEqual({
                _id: '123',
                email: 'test@example.com',
                role: 'user',
            });
            expect(User.findOne).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
            expect(User.create).toHaveBeenCalledWith({
                ...mockUserData,
                password: 'hashedpass',
            });
        });

        it('should throw an error if user already exists', async () => {
            (User.findOne as jest.Mock).mockImplementation(() => ({
                lean: jest.fn().mockResolvedValue({ email: 'test@example.com' }), // Mocking lean properly
            }));

            await expect(
                authService.register({
                    email: 'test@example.com',
                    password: 'password',
                }),
            ).rejects.toThrow('A user with this email already exists.');
        });
    });
});
