import { Request, Response, NextFunction } from 'express';

interface CustomRequest extends Request {
    user?: {
        role: string;
    };
}

const authorizeRole = (role: string) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        console.log(req.user);
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin access required',
            });
        }
        return next();
    };
};

export default authorizeRole;
