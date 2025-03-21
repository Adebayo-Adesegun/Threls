import { Request, Response, NextFunction } from 'express';

const authorize =
    (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        return next();
    };

export default authorize;
